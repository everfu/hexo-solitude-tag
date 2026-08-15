import {load as loadYaml} from 'js-yaml';
import {getCompatibilityContext} from '../context';
import {
  classNames,
  errorMessage,
  escapeHTML,
  htmlTag,
  parseCommaArgs,
  safeCssValue,
  tagClass
} from '../helpers';
import type {PluginContext, TagLocals} from '../types';

interface FlinkItem {
  name?: unknown;
  descr?: unknown;
  link?: unknown;
  avatar?: unknown;
}

interface FlinkGroup {
  class_name?: unknown;
  class_desc?: unknown;
  link_list?: FlinkItem[];
}

const renderNote = (context: PluginContext, args: string[], content = '') => {
  const tokens = args.flatMap(arg => arg.split(/\s+/)).filter(Boolean);
  const styles = ['simple', 'modern', 'flat', 'disabled'];
  const configuredStyle = context.config.note?.style || 'flat';
  const style = tokens.find(token => styles.includes(token)) || configuredStyle;
  const iconTokens = tokens.filter(token => /^(?:fa[brsld]?|fa)-/.test(token) || /^fa[brsld]?$/.test(token));
  const icon = iconTokens.length ? classNames(iconTokens.join(' ')) : '';
  const classes = tokens.filter(token => !styles.includes(token) && !iconTokens.includes(token));
  if (!classes.length) classes.push('default');
  if (!icon) classes.push('no-icon');

  return htmlTag('aside', {class: tagClass('note', classes.join(' '), style)},
    (icon ? htmlTag('i', {class: `note-icon solitude ${icon}`, 'aria-hidden': 'true'}, '', false) : '')
    + context.renderMarkdown(content), false);
};

const renderTimeline = (context: PluginContext, args: string[], content = '') => {
  const [title = '', color = ''] = parseCommaArgs(args);
  const timelineBlock = /<!--\s*timeline\s*(.*?)\s*-->\n([\s\S]*?)<!--\s*endtimeline\s*-->/g;
  const matches = [...content.matchAll(timelineBlock)];

  if (!matches.length) {
    return htmlTag('div', {class: tagClass('timeline', 'tag-timeline')},
      (title ? htmlTag('span', {class: 'timeline-title'}, escapeHTML(title), false) : '') + content, false);
  }

  const headline = title
    ? `<div class="timeline-item headline"><div class="timeline-item-title"><div class="item-circle">${context.renderMarkdown(title)}</div></div></div>`
    : '';
  const items = matches.map(match => `<div class="timeline-item">
    <div class="timeline-item-title"><div class="item-circle">${context.renderMarkdown(match[1])}</div></div>
    <div class="timeline-item-content">${context.renderMarkdown(match[2])}</div>
  </div>`).join('');

  return `<div class="${tagClass('timeline', 'tag-timeline', color)}">${headline}${items}</div>`;
};

const renderTimenode = (context: PluginContext, [time = '']: string[], content = '') => {
  return htmlTag('div', {class: tagClass('timenode', 'tag-timenode')},
    htmlTag('div', {class: 'meta'}, `<p>${escapeHTML(time)}</p>`, false)
    + `<div class="body">${context.renderMarkdown(content).split('\n').join('')}</div>`, false);
};

const hideStyle = (background = '', color = '') => {
  const safeBackground = safeCssValue(background);
  const safeColor = safeCssValue(color);
  const declarations = [
    safeBackground ? `--tag-hide-bg:${safeBackground}` : '',
    safeColor ? `--tag-hide-color:${safeColor}` : ''
  ].filter(Boolean);
  return declarations.length ? declarations.join(';') : undefined;
};

const hideMarkup = (
  context: PluginContext,
  display: string,
  content: string,
  background: string,
  color: string,
  block: boolean
) => {
  const id = context.nextHideId();
  const button = htmlTag('button', {
    type: 'button',
    class: 'tag-hide-button',
    'aria-expanded': 'false',
    'aria-controls': id,
    style: hideStyle(background, color)
  }, escapeHTML(display || 'Click'), false);
  const hidden = htmlTag(block ? 'div' : 'span', {
    id,
    class: 'tag-hide-content',
    hidden: true
  }, content, false);
  return htmlTag(block ? 'div' : 'span', {
    class: block
      ? tagClass('tag-hide', 'tag-hide-block')
      : tagClass('tag-hide', 'tag-hide-inline')
  }, button + hidden, false);
};

const renderHideInline = (context: PluginContext, args: string[]) => {
  const [content = '', display = 'Click', background = '', color = ''] = parseCommaArgs(args);
  return hideMarkup(context, display, escapeHTML(content), background, color, false);
};

const renderHideBlock = (context: PluginContext, args: string[], content = '') => {
  const [display = 'Click', background = '', color = ''] = parseCommaArgs(args);
  return hideMarkup(context, display, context.renderMarkdown(content), background, color, true);
};

const renderHideToggle = (context: PluginContext, args: string[], content = '') => {
  return renderHideBlock(context, args, content).replace('tag-hide-block', 'tag-hide-toggle');
};

const renderLabel = ([text = '', color = 'default']: string[]) => {
  return htmlTag('mark', {class: tagClass('hl-label', 'tag-label', classNames(color) || 'default')}, escapeHTML(text), false);
};

const renderFlink = (context: PluginContext, content = '') => {
  let groups: unknown;
  try {
    groups = loadYaml(content);
  } catch (error) {
    context.warn(`[hexo-solitude-tag] Invalid flink YAML: ${errorMessage(error)}`);
    return '<div class="solitude-tag flink tag-plugin-error" role="alert">Invalid flink data</div>';
  }

  if (!Array.isArray(groups)) {
    context.warn('[hexo-solitude-tag] flink expects a YAML array');
    return '<div class="solitude-tag flink tag-plugin-error" role="alert">Invalid flink data</div>';
  }

  const fallback = context.hexo.theme?.config?.lazyload?.errorimg || '';
  const result = (groups as FlinkGroup[]).map(group => {
    const links = Array.isArray(group.link_list) ? group.link_list : [];
    const items = links.map(link => {
      const name = escapeHTML(String(link.name || ''));
      const description = escapeHTML(String(link.descr || ''));
      const href = String(link.link || '');
      const external = /^(?:https?:)?\/\//i.test(href);
      const image = htmlTag('img', {
        class: 'flink-avatar cf-friends-avatar no-lightbox',
        src: context.urlFor(String(link.avatar || '')),
        alt: name,
        loading: 'lazy',
        'data-fallback': fallback ? context.urlFor(fallback) : undefined
      });
      return `<div class="flink-list-item"><a href="${escapeHTML(context.urlFor(href))}" title="${name}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
        ${image}
        <div class="flink-item-info">
          <span class="flink-item-name cf-friends-name">${name}</span>
          <span class="flink-item-desc" title="${description}">${description}</span>
        </div>
      </a></div>`;
    }).join('');
    const groupName = group.class_name
      ? `<div class="flink-name">${escapeHTML(String(group.class_name))}</div>`
      : '';
    const groupDescription = group.class_desc
      ? `<div class="flink-desc">${escapeHTML(String(group.class_desc))}</div>`
      : '';
    return `${groupName}${groupDescription}<div class="flink-list">${items}</div>`;
  }).join('');

  return `<div class="${tagClass('flink', 'tag-flink')}">${result}</div>`;
};

const renderScore = (context: PluginContext, content = '') => {
  const trimmed = content.trim();
  const parts = trimmed.split('------');
  let parameters: Record<string, unknown> = {};
  let score = trimmed;

  if (parts.length > 1) {
    const parameterSource = parts.shift()?.trim() || '';
    score = parts.join('------').trim();
    try {
      parameters = JSON.parse(parameterSource);
    } catch (error) {
      context.warn(`[hexo-solitude-tag] Invalid ABCJS parameters: ${errorMessage(error)}`);
    }
  }

  return `<div class="${tagClass('abc-music-sheet', 'tag-score')}" data-params="${escapeHTML(JSON.stringify(parameters))}" aria-label="Music notation">${escapeHTML(score)}</div>`;
};

const renderSeries = (context: PluginContext, locals: TagLocals, args: string[]) => {
  const groupName = args.length ? args.join(' ').trim() : locals?.series;
  if (!groupName) {
    context.warn('[hexo-solitude-tag] No series specified');
    return '';
  }

  const config = context.config.series || {};
  const orderBy = config.orderBy === 'date' ? 'date' : 'title';
  const order = Number(config.order) === -1 ? -1 : 1;
  const numbered = config.number !== false;
  const posts = context.posts()
    .filter(post => post.series === groupName)
    .map(post => ({
      title: String(post.title || ''),
      path: String(post.path || ''),
      date: post.date?.valueOf?.() || 0
    }))
    .sort((a, b) => {
      const left = orderBy === 'date' ? a.date : a.title.toLocaleUpperCase();
      const right = orderBy === 'date' ? b.date : b.title.toLocaleUpperCase();
      if (left < right) return -1 * order;
      if (left > right) return order;
      return 0;
    });

  if (!posts.length) {
    context.warn(`[hexo-solitude-tag] There is no series named "${groupName}"`);
    return '';
  }

  const items = posts.map(post => `<li><a href="${escapeHTML(context.urlFor(post.path))}" title="${escapeHTML(post.title)}">${escapeHTML(post.title)}</a></li>`).join('');
  const element = numbered ? 'ol' : 'ul';
  return `<${element} class="${tagClass('series-items', 'tag-series')}">${items}</${element}>`;
};

const renderChartjs = (context: PluginContext, args: string[], content = '') => {
  const chartMatch = content.match(/<!--\s*chart\s*-->\n([\s\S]*?)<!--\s*endchart\s*-->/);
  const descriptionMatch = content.match(/<!--\s*desc\s*-->\n([\s\S]*?)<!--\s*enddesc\s*-->/);
  if (!chartMatch) {
    context.warn('[hexo-solitude-tag] chartjs requires a chart block');
    return '<div class="solitude-tag chartjs-container tag-plugin-error" role="alert">Missing chart configuration</div>';
  }

  const chartDefinition = chartMatch[1].trim();
  try {
    JSON.parse(chartDefinition);
  } catch (error) {
    context.warn(`[hexo-solitude-tag] Invalid Chart.js JSON: ${errorMessage(error)}`);
    return '<div class="solitude-tag chartjs-container tag-plugin-error" role="alert">Invalid chart configuration</div>';
  }

  const [rawWidth = '', rawLayout = '', rawId = ''] = parseCommaArgs(args);
  const widthNumber = Number(rawWidth);
  const width = Number.isFinite(widthNumber) && widthNumber > 0 && widthNumber <= 100
    ? `${widthNumber}%`
    : '';
  const layout = rawLayout && rawLayout !== 'false';
  const id = rawId.replace(/[^a-z0-9_-]/gi, '');
  const description = descriptionMatch ? context.renderMarkdown(descriptionMatch[1]) : '';

  return `<div class="${tagClass('chartjs-container', 'tag-chart', layout ? 'chartjs-abreast' : '')}"${width ? ` data-width="${width}"` : ''}${id ? ` data-chartjs-id="${id}"` : ''}>
    <pre class="chartjs-src" hidden>${escapeHTML(chartDefinition)}</pre>
    ${description ? `<div class="chartjs-desc">${description}</div>` : ''}
  </div>`;
};

export const createContentTagHandlers = (context: PluginContext) => ({
  note: (args: string[], content = '') => renderNote(context, args, content),
  timeline: (args: string[], content = '') => renderTimeline(context, args, content),
  timenode: (args: string[], content = '') => renderTimenode(context, args, content),
  hideInline: (args: string[]) => renderHideInline(context, args),
  hideBlock: (args: string[], content = '') => renderHideBlock(context, args, content),
  hideToggle: (args: string[], content = '') => renderHideToggle(context, args, content),
  label: renderLabel,
  flink: (_args: string[], content = '') => renderFlink(context, content),
  score: (_args: string[], content = '') => renderScore(context, content),
  series(this: TagLocals, args: string[]) {
    return renderSeries(context, this, args);
  },
  chartjs: (args: string[], content = '') => renderChartjs(context, args, content)
});

export function noteTag(args: string[], content = '') { return renderNote(getCompatibilityContext(), args, content); }
export function timelineTag(args: string[], content = '') { return renderTimeline(getCompatibilityContext(), args, content); }
export function timenodeTag(args: string[], content = '') { return renderTimenode(getCompatibilityContext(), args, content); }
export function hideInlineTag(args: string[]) { return renderHideInline(getCompatibilityContext(), args); }
export function hideBlockTag(args: string[], content = '') { return renderHideBlock(getCompatibilityContext(), args, content); }
export function hideToggleTag(args: string[], content = '') { return renderHideToggle(getCompatibilityContext(), args, content); }
export function labelTag(args: string[]) { return renderLabel(args); }
export function flinkTag(_args: string[], content = '') { return renderFlink(getCompatibilityContext(), content); }
export function scoreTag(_args: string[], content = '') { return renderScore(getCompatibilityContext(), content); }
export function seriesTag(this: TagLocals, args: string[]) { return renderSeries(getCompatibilityContext(), this, args); }
export function chartjsTag(args: string[], content = '') { return renderChartjs(getCompatibilityContext(), args, content); }
