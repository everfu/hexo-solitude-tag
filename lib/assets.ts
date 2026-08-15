import fs from 'node:fs';
import path from 'node:path';
import {escapeHTML} from './helpers';
import type {PluginContext} from './types';

const DEFAULT_CHARTJS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.js';
const DEFAULT_ABCJS_CDN = 'https://cdn.jsdelivr.net/npm/abcjs@6.6.4/dist/abcjs-basic-min.js';
const RUNTIME_ROUTE = 'js/hexo-solitude-tag/runtime.js';
const STYLE_MARKER = '/* hexo-solitude-tag */';

const packageVersion = (() => {
  const packagePath = [
    path.join(__dirname, '..', 'package.json'),
    path.join(process.cwd(), 'package.json')
  ].find(candidate => fs.existsSync(candidate));
  if (!packagePath) throw new Error('[hexo-solitude-tag] Missing package.json');
  return JSON.parse(fs.readFileSync(packagePath, 'utf8')).version as string;
})();

const readAsset = (relativePath: string) => {
  const candidates = [
    path.join(__dirname, relativePath),
    path.join(__dirname, '..', 'dist', relativePath),
    path.join(process.cwd(), 'dist', relativePath)
  ];
  const assetPath = candidates.find(candidate => fs.existsSync(candidate));
  if (!assetPath) throw new Error(`[hexo-solitude-tag] Missing built asset: ${relativePath}`);
  return fs.readFileSync(assetPath, 'utf8');
};

let cachedCss: string | undefined,
  cachedRuntime: string | undefined;

const pluginCss = () => {
  cachedCss ||= readAsset(path.join('css', 'index.css'));
  return cachedCss;
};

const runtimeSource = () => {
  cachedRuntime ||= readAsset(path.join('runtime', 'client.js'));
  return cachedRuntime;
};

const runtimeTag = (context: PluginContext) => {
  const cdn = context.config.cdn || {};
  const chartjs = cdn.chartjs || context.hexo.theme?.config?.cdn?.chart_js || DEFAULT_CHARTJS_CDN;
  const abcjs = cdn.abcjs || DEFAULT_ABCJS_CDN;
  const src = context.urlFor(`${RUNTIME_ROUTE}?v=${packageVersion}`);
  return `<script defer src="${escapeHTML(src)}" data-hexo-solitude-tag-runtime data-chartjs="${escapeHTML(chartjs)}" data-abcjs="${escapeHTML(abcjs)}"></script>`;
};

export const registerAssets = (context: PluginContext) => {
  const {hexo} = context;
  hexo.extend.generator.register('hexo-solitude-tag-runtime', () => ({
    path: RUNTIME_ROUTE,
    data: runtimeSource()
  }));

  hexo.extend.filter.register('after_render:css', (css: string, data: {path?: string}) => {
    const renderedPath = data?.path?.replace(/\\/g, '/') || '';
    if (!renderedPath.endsWith('/source/css/index.styl') || css.includes(STYLE_MARKER)) return css;
    return `${css.trimEnd()}\n${STYLE_MARKER}${pluginCss()}`;
  });

  hexo.extend.filter.register('after_render:html', (html: string) => {
    if (html.includes('data-hexo-solitude-tag-runtime') || !html.includes('</body>')) return html;
    return html.replace('</body>', `${runtimeTag(context)}</body>`);
  });
};
