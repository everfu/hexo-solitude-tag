import {url_for} from 'hexo-util';
import type {HexoInstance, PluginContext, PostRecord} from './types';

const contexts = new WeakMap<HexoInstance, PluginContext>();
let compatibilityContext: PluginContext | undefined;

export const createPluginContext = (hexo: HexoInstance): PluginContext => {
  const cached = contexts.get(hexo);
  if (cached) return cached;

  let hideId = 0;
  const context: PluginContext = {
    hexo,
    get config() {
      return hexo.config.solitude_tag || {};
    },
    renderMarkdown(content) {
      return hexo.render.renderSync({
        text: content,
        engine: 'markdown'
      }).trim();
    },
    urlFor(url) {
      return url_for.call(hexo, url || '');
    },
    warn(message) {
      hexo.log.warn(message);
    },
    posts() {
      return hexo.model('Post').toArray() as PostRecord[];
    },
    nextHideId() {
      hideId += 1;
      return `tag-hide-content-${hideId}`;
    }
  };

  contexts.set(hexo, context);
  return context;
};

export const setCompatibilityContext = (context: PluginContext) => {
  compatibilityContext = context;
};

export const getCompatibilityContext = () => {
  if (!compatibilityContext) {
    throw new Error('[hexo-solitude-tag] registerTagPlugin(hexo) must be called before using this exported tag handler directly.');
  }
  return compatibilityContext;
};
