import path from 'node:path';
import {htmlTag} from 'hexo-util';

// @ts-ignore
hexo.extend.tag.register('youtube', youtubeTag);

// @ts-ignore
hexo.extend.tag.register('p', pTag);

// @ts-ignore
hexo.extend.tag.register('span', spanTag);

// @ts-ignore
hexo.extend.tag.register('bvideo', bvideoTag);

// @ts-ignore
hexo.extend.tag.register('fold', foldTag, {ends: true});

// @ts-ignore
hexo.extend.tag.register('audio', audioTag);

// @ts-ignore
hexo.extend.tag.register('video', videoTag);

// @ts-ignore
hexo.extend.tag.register('videos', videosTag, {ends: true});

// @ts-ignore
hexo.extend.tag.register('link', linkTag);

// @ts-ignore
hexo.extend.tag.register('label', labelTag);

// @ts-ignore
hexo.extend.tag.register('mermaid', mermaidTag, {ends: true});

// @ts-ignore
hexo.extend.tag.register('img', imgTag);

// @ts-ignore
hexo.extend.tag.register('inline_img', inlineImgTag);

// @ts-ignore
hexo.extend.tag.register('checkbox', checkboxTag);

// @ts-ignore
hexo.extend.tag.register('radio', radioTag);

// @ts-ignore
hexo.extend.tag.register('note', noteTag, {ends: true});

// @ts-ignore
hexo.extend.tag.register('timeline', timelineTag, {ends: true});

// @ts-ignore
hexo.extend.tag.register('timenode', timenodeTag, {ends: true});

let _span = false;
let _video = false;
let _fold = false;
let _link = false;
let _label = false;
let _mermaid = false;
let _inline_img = false;
let _check = false;
let _note = false;
let _timeline = false;
// @ts-ignore
hexo.extend.filter.register('stylus:renderer', (style: any) => {
  style
    .define('$tag_span', _span)
    .define('$tag_video', _video)
    .define('$tag_fold', _fold)
    .define('$tag_link', _link)
    .define('$tag_label', _label)
    .define('$tag_mermaid', _mermaid)
    .define('$tag_inline_img', _inline_img)
    .define('$tag_checkbox', _check)
    .define('$tag_note', _note)
    .define('$tag_timeline', _timeline)
    .import(path.join(__dirname, 'css', 'index.styl'));
});

// @ts-ignore
hexo.extend.filter.register('after_generate', () => {
  // @ts-ignore
  const {config} = hexo.theme.config;
  // @ts-ignore
  hexo.extend.injector.register('head_begin', () => {
    let result = '';
    if (_mermaid) {
      result += `<link rel="stylesheet" href='${config.CDN.mermaid_js}'>`;
    }
    return result;
  });
});

type str = [string];
type str2 = [string, string];
type strbool = [string, boolean];
type str2bool = [string, string, boolean];
type strnum = [string, number];
type str3 = [string, string, string];

/**
 * Bilibili video tag
 *
 * Syntax:
 *  {% bvideo bvid %}
 */
export function bvideoTag([id]: str) {
  _video = true;
  return htmlTag('div', {
    class: 'video-container'
  }, htmlTag('iframe', {
    src: '//player.bilibili.com/player.html?autoplay=0&bvid=' + id,
    frameborder: '0',
    loading: 'lazy',
    allowfullscreen: true
  }, ''), false);
}

/**
 * Youtube tag
 *
 * Syntax:
 *   {% youtube video_id, type, cookie %}
 */
export function youtubeTag([id, type = 'video', cookie = true]: str | str2 | strbool | str2bool) {
  if (typeof type === 'boolean') {
    cookie = type;
    type = 'video';
  }

  const ytLink = cookie ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com';
  const embed = type === 'video' ? '/embed/' : '/embed/videoseries?list=';

  const iframeTag = htmlTag('iframe', {
    src: ytLink + embed + id,
    frameborder: '0',
    loading: 'lazy',
    allowfullscreen: true
  }, '');

  return htmlTag('div', {class: 'video-container'}, iframeTag, false);
}

/**
 * Span tag
 *
 * Syntax:
 *  {% span class content %}
 */
export function spanTag([cls, text]: str2) {
  _span = true;
  return htmlTag('span', {class: cls}, text, false);
}

/**
 * P tag
 *
 * Syntax:
 * {% p class content %}
 */
export function pTag([cls, text]: str2) {
  _span = true;
  return htmlTag('p', {class: cls}, text, false);
}

/**
 * Fold tag
 *
 * Syntax:
 * {% fold title open %}
 * content
 * {% endfold %}
 */
export function foldTag([title, open]: str2) {
  _fold = true;
  return htmlTag('details', {open}, htmlTag('summary', {}, title, false), false);
}

/**
 * Audio tag
 *
 * Syntax:
 * {% audio src %}
 */
export function audioTag([src]: str) {
  return htmlTag('div', {class: 'audio-container'}, htmlTag('audio', {src, controls: true}, '', false), false);
}

/**
 * Video tag
 *
 * Syntax:
 * {% video src %}
 */
export function videoTag([src]: str) {
  _video = true;
  return htmlTag('div', {class: 'video-container'}, htmlTag('audio', {src, controls: true}, '', false), false);
}

/**
 * Videos tag
 *
 * Syntax:
 * {% videos %}
 *  {% video src %}
 *  {% video src %}
 * {% endvideos %}
 */
export function videosTag([cls, col]: strnum, content: string) {
  return htmlTag('div', {class: `videos${cls}`, col: col}, content, false);
}

/**
 * Link tag
 *
 * Syntax:
 * {% link title subtitle link %}
 */
export function linkTag([title, subtitle, link]: str3) {
  _link = true;
  const isLocal = link.startsWith('/');
  const bottom = `
    <div class="tag-link-tips">${isLocal ? '站内链接' : '引用站外链接'}</div>
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
    class: 'tag-link',
    href: link, target: isLocal ? '_self' : '_blank'
  }, bottom, false);
}

/**
 * Label tag
 *
 * Syntax:
 * {% label text %}
 */
export function labelTag([cls, text]: str2) {
  _label = true;
  return htmlTag('span', {class: `hl-label bg-${cls}`}, text, false);
}

/**
 * Mermaid tag
 *
 * Syntax:
 * {% mermaid %}
 * graph TD;
 *  A-->B;
 *  A-->C;
 *  B-->D;
 *  C-->D;
 * {% endmermaid %}
 */
export function mermaidTag(args: string[], [content]: str) {
  _mermaid = true;
  return htmlTag('div', {class: 'mermaid'}, content, false);
}

/**
 * Image tag
 *
 * Syntax:
 * {% img src alt style %}
 */
export function imgTag([src, alt, style]: str3) {
  return htmlTag('img', {src, alt, style});
}

/**
 * Inline Image tag
 *
 * Syntax:
 * {% inline_img src alt height %}
 */
export function inlineImgTag([src, alt, height]: str3) {
  _inline_img = true;
  return htmlTag('img', {src, alt, height});
}

/**
 * CheckBox tag
 *
 * Syntax:
 * {% checkbox style checked content %}
 */
export function checkboxTag([style, checked, content]: str3 | str2) {
  _check = true;
  if (typeof content === 'undefined') {
    content = checked;
    checked = 'checked';
  }
  return htmlTag('div', {class: 'checkbox'}, htmlTag('input', {
    type: 'checkbox',
    checked,
    style
  }, content, false), false);
}

/**
 * Radio tag
 *
 * Syntax:
 * {% radio style checked content %}
 */
export function radioTag([style, checked, content]: str3 | str2) {
  _check = true;
  if (typeof content === 'undefined') {
    content = checked;
    checked = 'checked';
  }
  return htmlTag('div', {class: 'checkbox'}, htmlTag('input', {
    type: 'radio',
    checked,
    style
  }, content, false), false);
}

/**
 * Note tag
 *
 * Syntax:
 * {% note class icon %}
 * content
 * {% endnote %}
 */
export function noteTag([cls, icon]: str2 | string, content: string) {
  _note = true;
  if (typeof icon === 'undefined') {
    icon = 'no-icon';
  }
  return htmlTag('div', {class: `note ${cls}`}, htmlTag('i', {class: `solitude ${icon}`}, '', false) + content, false);
}

/**
 * TimeLine tag
 *
 * Syntax:
 * {% timeline title %}
 * content
 * {% ebdtimeline %}
 */
export function timelineTag([title]: str, content: string) {
  _timeline = true;
  return htmlTag('div', {class: 'timeline'}, htmlTag('h1', {class: 'timeline-title'}, title, false) + content, false);
}

/**
 * TimeNode tag
 *
 * Syntax:
 * {% timenode time %}
 * content
 * {% endtimenode %}
 */
export function timenodeTag([time]: str, content: string) {
  _timeline = true;
  return htmlTag('div', {class: 'timenode'}, htmlTag('div', {class: 'meta'}, `<p>${time}</p>`, false) + `<div class="body">${content}</div>`, false);
}
