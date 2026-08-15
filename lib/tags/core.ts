import {getCompatibilityContext} from '../context';
import {
  classNames,
  escapeHTML,
  htmlTag,
  parseCommaArgs,
  safeCssValue,
  safeStyleUrl,
  tagClass
} from '../helpers';
import type {PluginContext} from '../types';

const renderBvideo = ([id = '']: string[]) => htmlTag('div', {
  class: tagClass('video-container', 'tag-video-embed', 'tag-video-bilibili')
}, htmlTag('iframe', {
  src: `//player.bilibili.com/player.html?autoplay=0&bvid=${id}`,
  title: 'Bilibili video player',
  frameborder: '0',
  loading: 'lazy',
  allowfullscreen: true
}, ''), false);

const renderYoutube = ([id = '', type = 'video', cookie = true]: Array<string | boolean>) => {
  if (typeof type === 'boolean') {
    cookie = type;
    type = 'video';
  }

  const ytLink = cookie ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com';
  const embed = type === 'video' ? '/embed/' : '/embed/videoseries?list=';
  const iframe = htmlTag('iframe', {
    src: ytLink + embed + id,
    title: 'YouTube video player',
    frameborder: '0',
    loading: 'lazy',
    allowfullscreen: true
  }, '');

  return htmlTag('div', {
    class: tagClass('video-container', 'tag-video-embed', 'tag-video-youtube')
  }, iframe, false);
};

const renderSpan = ([cls = '', text = '']: string[]) => {
  return htmlTag('span', {class: tagClass('tag-text', 'tag-span', cls)}, text, false);
};

const renderParagraph = ([cls = '', text = '']: string[]) => {
  return htmlTag('p', {class: tagClass('tag-text', 'tag-paragraph', cls)}, text, false);
};

const renderFold = (context: PluginContext, [title = '', open = '']: string[], content = '') => {
  return htmlTag('details', {open, class: tagClass('tag-fold')},
    htmlTag('summary', {class: 'tag-fold-summary'},
      `<span class="tag-fold-title">${escapeHTML(title)}</span><span class="tag-fold-icon" aria-hidden="true"></span>`, false)
    + htmlTag('div', {class: 'tag-fold-content'}, context.renderMarkdown(content), false), false);
};

const renderAudio = ([src = '']: string[]) => {
  const source = htmlTag('source', {src, type: 'audio/mp3'});
  return htmlTag('div', {class: tagClass('audio', 'tag-audio')},
    htmlTag('span', {class: 'tag-media-icon', 'aria-hidden': 'true'}, '<i class="fas fa-music"></i>', false)
    + htmlTag('audio', {controls: true, preload: 'metadata'}, `${source}Your browser does not support the audio tag.`, false), false);
};

const renderVideo = ([src = '']: string[]) => {
  const source = htmlTag('source', {src, type: 'video/mp4'});
  return htmlTag('div', {class: tagClass('video', 'tag-video')},
    htmlTag('video', {controls: true, preload: 'metadata'}, `${source}Your browser does not support the video tag.`, false), false);
};

const renderVideos = ([col = '']: string[], content = '') => {
  return htmlTag('div', {class: tagClass('videos', 'tag-videos'), col}, content, false);
};

const renderLink = (context: PluginContext, [title = '', subtitle = '', link = '']: string[]) => {
  const isLocal = link.startsWith('/');
  const body = `
    <div class="tag-link-tips"><i class="fas fa-${isLocal ? 'house' : 'arrow-up-right-from-square'}" aria-hidden="true"></i>${isLocal ? '站内链接' : '引用站外链接'}</div>
    <div class="tag-link-bottom">
        <div class="tag-link-left">
          <i class="solitude fas fa-link"></i>
        </div>
        <div class="tag-link-right">
            <div class="tag-link-title">${title}</div>
            <div class="tag-link-sitename">${subtitle}</div>
        </div>
        <i class="solitude fas fa-chevron-right"></i>
    </div>`;
  return htmlTag('a', {
    class: tagClass('tag-link'),
    href: context.urlFor(link),
    target: isLocal ? undefined : '_blank',
    rel: isLocal ? undefined : 'noopener noreferrer',
    'aria-label': `${title}：${subtitle}`
  }, body, false);
};

const renderImage = (context: PluginContext, [src = '', alt = '', style = '']: string[]) => {
  return htmlTag('img', {src: context.urlFor(src), alt, style, class: tagClass('tag-image')});
};

const renderInlineImage = (context: PluginContext, [src = '', title = '', height = '']: string[]) => {
  return htmlTag('img', {
    src: context.urlFor(src),
    title,
    height,
    alt: title || '',
    class: tagClass('inline-img', 'tag-inline-image')
  });
};

const renderButterflyInlineImage = (context: PluginContext, [src = '', height = '']: string[]) => {
  const style = height ? `height:${safeCssValue(height)}` : undefined;
  return htmlTag('img', {
    src: context.urlFor(src),
    style,
    class: tagClass('inline-img', 'tag-inline-image'),
    alt: ''
  });
};

const renderChoice = (context: PluginContext, kind: 'checkbox' | 'radio', [style = '', checked = '', content]: string[]) => {
  if (typeof content === 'undefined') {
    content = checked;
    checked = 'checked';
  }
  const markdown = context.renderMarkdown(content).split('\n').join('');
  return htmlTag('div', {class: tagClass('checkbox', 'tag-choice', style)},
    `<input type="${kind}" aria-label="${escapeHTML(String(content))}" ${checked === 'unchecked' ? '' : `checked=${checked}`}/><span class="tag-choice-content">${markdown}</span>`, false);
};

const renderButton = (context: PluginContext, [icon = '', content = '', url]: string[]) => {
  if (url === undefined) {
    url = content;
    content = '';
  }

  const external = /^(?:https?:)?\/\//i.test(url);
  const iconClass = classNames(icon);
  const hasIcon = Boolean(iconClass);
  const hasText = Boolean(content);
  const contentHtml = content ? htmlTag('span', {}, escapeHTML(content), false) : '';
  const iconHtml = hasIcon
    ? htmlTag('i', {class: `solitude ${iconClass}`, 'aria-hidden': 'true'}, '', false)
    : '';

  return htmlTag('a', {
    class: tagClass('st-btn', 'tag-button', hasIcon ? 'has-icon' : '', hasText ? '' : 'is-icon-only'),
    href: context.urlFor(url),
    'aria-label': hasText ? undefined : '打开链接',
    target: external ? '_blank' : undefined,
    rel: external ? 'noopener noreferrer' : undefined
  }, iconHtml + contentHtml, false);
};

const renderButterflyButton = (context: PluginContext, args: string[]) => {
  const [url = '', text = '', icon = '', option = ''] = parseCommaArgs(args);
  const iconHtml = icon ? htmlTag('i', {class: classNames(icon), 'aria-hidden': 'true'}, '', false) : '';
  const textHtml = text ? htmlTag('span', {}, escapeHTML(text), false) : '';
  const external = /^(?:https?:)?\/\//i.test(url);
  const hasIcon = Boolean(iconHtml);
  const hasText = Boolean(textHtml);

  return htmlTag('a', {
    class: tagClass('btn-beautify', 'tag-button', option, hasIcon ? 'has-icon' : '', hasText ? '' : 'is-icon-only'),
    href: context.urlFor(url),
    'aria-label': text ? undefined : '打开链接',
    target: external ? '_blank' : undefined,
    rel: external ? 'noopener noreferrer' : undefined
  }, iconHtml + textHtml, false);
};

const renderBubble = ([content = '', notation = '', color = 'blue']: string[]) => {
  const safeColor = safeCssValue(color);
  if (/^#[0-9a-f]{6}$/i.test(safeColor)) {
    const red = parseInt(safeColor.slice(1, 3), 16) / 255;
    const green = parseInt(safeColor.slice(3, 5), 16) / 255;
    const blue = parseInt(safeColor.slice(5, 7), 16) / 255;
    const brightness = 0.5474 * Math.sqrt((red ** 2) + ((1.5 * green) ** 2) + ((0.6 * blue) ** 2));
    return htmlTag('span', {class: tagClass('bubble', 'tag-bubble')},
      htmlTag('span', {class: 'bubble-content', tabindex: '0'}, escapeHTML(content), false)
      + htmlTag('span', {class: 'bubble-notation'}, htmlTag('span', {
        class: 'bubble-item',
        style: `background-color:${safeColor}; color: ${brightness > 0.5 ? 'var(--efu-black)' : 'var(--efu-white)'}`
      }, escapeHTML(notation), false), false), false);
  }
  const namedColor = classNames(color).split(' ')[0] || 'blue';
  return htmlTag('span', {class: tagClass('bubble', 'tag-bubble')},
    htmlTag('span', {class: 'bubble-content', tabindex: '0'}, escapeHTML(content), false)
    + htmlTag('span', {class: `bubble-notation bg-${namedColor}`}, escapeHTML(notation), false), false);
};

const renderKeyboard = ([value = '']: string[]) => {
  let key = value.toLowerCase();
  switch (key) {
    case 'enter':
      key += '↵';
      break;
    case 'shift':
      key += '⇧';
      break;
    case 'windows':
    case 'window':
    case 'win':
      key = 'win';
      // fallthrough
    case 'command':
      key += '⌘';
      break;
    case 'option':
      key += '⌥';
      break;
    default:
      break;
  }
  key = key ? key[0].toUpperCase() + key.slice(1) : '';
  return htmlTag('kbd', {class: tagClass('keyboard-tag', 'tag-keyboard')}, escapeHTML(key), false);
};

const renderSpoiler = ([style = '', content = '']: string[]) => htmlTag('span', {
  class: tagClass('spoiler', 'tag-spoiler', `${style}-text`),
  tabindex: '0',
  'aria-label': 'Hidden text'
}, escapeHTML(content), false);

const renderCard = (context: PluginContext, args: string[]) => {
  const toStar = (value: number) => {
    const fullStars = Math.floor(value);
    const halfStar = value - fullStars !== 0 ? '<i class="fa-solid fa-star-half-alt"></i>' : '';
    const emptyStars = 5 - Math.ceil(value);
    return '<i class="fa-solid fa-star"></i>'.repeat(fullStars) + halfStar + '<i class="fa-regular fa-star"></i>'.repeat(emptyStars);
  };

  const [rawName = '', url = '', bg = '', star = '0', rawText = '', icon = '', tag = '', width = '200px', height = '275px'] = parseCommaArgs(args);
  const name = rawName || '未知';
  const text = rawText || '暂无简介';
  const coverUrl = bg ? safeStyleUrl(context, bg) : '';
  const backgroundStyle = coverUrl ? `background-image:url("${coverUrl}");` : 'background-color:#333;';
  const score = Math.min(5, Math.max(0, Number(star) || 0));
  const external = /^(?:https?:)?\/\//i.test(url);

  return htmlTag('article', {
    title: name,
    class: tagClass('card_box', 'tag-card', coverUrl ? 'has-cover' : 'no-cover', url ? 'has-action' : 'no-action'),
    style: `${backgroundStyle} width:${safeCssValue(width) || '200px'}; height:${safeCssValue(height) || '275px'};`
  },
  htmlTag('div', {class: 'card_mask card_info'},
    htmlTag('span', {class: 'card_description'}, escapeHTML(text), false)
    + (url ? htmlTag('a', {
      class: 'card_action',
      href: context.urlFor(url),
      target: external ? '_blank' : undefined,
      rel: external ? 'noopener noreferrer' : undefined
    }, '查看详情', false) : ''), false)
  + htmlTag('div', {class: 'card_top'},
    (icon ? htmlTag('i', {class: classNames(icon), 'aria-hidden': 'true'}, '', false) : '')
    + (tag ? htmlTag('span', {class: 'card_tag'}, escapeHTML(tag), false) : ''), false)
  + htmlTag('div', {class: 'card_content'},
    htmlTag('span', {class: 'card_title'}, escapeHTML(name), false)
    + htmlTag('div', {class: 'card_rating', 'aria-label': `评分 ${score} / 5`}, toStar(score), false), false), false);
};

export const createCoreTagHandlers = (context: PluginContext) => ({
  bvideo: renderBvideo,
  youtube: renderYoutube,
  span: renderSpan,
  p: renderParagraph,
  fold: (args: string[], content = '') => renderFold(context, args, content),
  audio: renderAudio,
  video: renderVideo,
  videos: renderVideos,
  link: (args: string[]) => renderLink(context, args),
  img: (args: string[]) => renderImage(context, args),
  inline_img: (args: string[]) => renderInlineImage(context, args),
  inlineImg: (args: string[]) => renderButterflyInlineImage(context, args),
  checkbox: (args: string[]) => renderChoice(context, 'checkbox', args),
  radio: (args: string[]) => renderChoice(context, 'radio', args),
  button: (args: string[]) => renderButton(context, args),
  btn: (args: string[]) => renderButterflyButton(context, args),
  bubble: renderBubble,
  keyboard: renderKeyboard,
  spoiler: renderSpoiler,
  card: (args: string[]) => renderCard(context, args)
});

export function bvideoTag(args: string[]) { return renderBvideo(args); }
export function youtubeTag(args: Array<string | boolean>) { return renderYoutube(args); }
export function spanTag(args: string[]) { return renderSpan(args); }
export function pTag(args: string[]) { return renderParagraph(args); }
export function foldTag(args: string[], content = '') { return renderFold(getCompatibilityContext(), args, content); }
export function audioTag(args: string[]) { return renderAudio(args); }
export function videoTag(args: string[]) { return renderVideo(args); }
export function videosTag(args: string[], content = '') { return renderVideos(args, content); }
export function linkTag(args: string[]) { return renderLink(getCompatibilityContext(), args); }
export function imgTag(args: string[]) { return renderImage(getCompatibilityContext(), args); }
export function inlineImgTag(args: string[]) { return renderInlineImage(getCompatibilityContext(), args); }
export function butterflyInlineImgTag(args: string[]) { return renderButterflyInlineImage(getCompatibilityContext(), args); }
export function checkboxTag(args: string[]) { return renderChoice(getCompatibilityContext(), 'checkbox', args); }
export function radioTag(args: string[]) { return renderChoice(getCompatibilityContext(), 'radio', args); }
export function buttonTag(args: string[]) { return renderButton(getCompatibilityContext(), args); }
export function butterflyButtonTag(args: string[]) { return renderButterflyButton(getCompatibilityContext(), args); }
export function bubbleTag(args: string[]) { return renderBubble(args); }
export function keyboardTag(args: string[]) { return renderKeyboard(args); }
export function spoilerTag(args: string[]) { return renderSpoiler(args); }
export function cardTag(args: string[]) { return renderCard(getCompatibilityContext(), args); }
