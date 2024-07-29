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

let _span = false;
let _video = false;
let _fold = false;
let _link = false;
let _label = false;
// @ts-ignore
hexo.extend.filter.register('after_render:html', () => {
  // @ts-ignore
  hexo.extend.filter.register('stylus:renderer', (style: any) => {
    style
      .define('$tag_span', _span)
      .define('$tag_video', _video)
      .define('$tag_fold', _fold)
      .define('$tag_link', _link)
      .define('$tag_label', _label)
      .import(path.join(__dirname, 'css', 'index.styl'));
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
 *  {% span class, content %}
 */
export function spanTag([cls, text]: str2) {
  _span = true;
  return htmlTag('span', {class: cls}, text, false);
}

/**
 * P tag
 *
 * Syntax:
 * {% p class, content %}
 */
export function pTag([cls, text]: str2) {
  _span = true;
  return htmlTag('p', {class: cls}, text, false);
}

/**
 * Fold tag
 *
 * Syntax:
 * {% fold title , open %}
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
 * {% link title,subtitle,link %}
 */
export function linkTag([title, subtitle, link]: str3) {
  _link = true;
  const isLocal = link.startsWith('/');
  const api = 'https://api.iowen.cn/favicon/';
  const content = htmlTag('div', {
    class: 'tag-link-left',
    style: `background-image: url(${api}${link})`
  }, htmlTag('i', {
    class: 'solitude fas fa-link'
  })) + htmlTag('div', {class: 'tag-link-right'}, htmlTag('div', {class: 'tag-link-title'}, title, false) + htmlTag('div', {class: 'tag-link-sitename'}, subtitle, false), false);
  const html = htmlTag('div', {class: 'tag-link-tips'}, isLocal ? '站内链接' : '引用站外链接', false) + htmlTag('div', {class: 'tag-link-bottom'}, content, false);
  return htmlTag('a', {class: 'tag-link', href: link, target: isLocal ? '_self' : '_blank'}, html, false);
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
