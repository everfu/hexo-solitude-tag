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
// @ts-ignore
hexo.extend.tag.register('button', buttonTag);
// @ts-ignore
hexo.extend.tag.register('github', githubTag);
// @ts-ignore
hexo.extend.tag.register('gitlab', gitlabTag);
// @ts-ignore
hexo.extend.tag.register('gitee', giteeTag);
// @ts-ignore
hexo.extend.tag.register('gitea', giteaTag);
// @ts-ignore
hexo.extend.tag.register('bubble', bubbleTag);
// @ts-ignore
hexo.extend.tag.register('keyboard', keyboardTag);


let _span = false;
let _fold = false;
let _link = false;
let _label = false;
let _inline_img = false;
let _check = false;
let _note = false;
let _timeline = false;
let _media = false;
let _button = false;
let _repo = false;
let _bubble = false;
let _keyboard = false;
// @ts-ignore
hexo.extend.filter.register('stylus:renderer', (style: any) => {
  style
    .define('$tag_span', _span)
    .define('$tag_fold', _fold)
    .define('$tag_link', _link)
    .define('$tag_label', _label)
    .define('$tag_inline_img', _inline_img)
    .define('$tag_checkbox', _check)
    .define('$tag_note', _note)
    .define('$tag_timeline', _timeline)
    .define('$tag_media', _media)
    .define('$tag_button', _button)
    .define('$tag_repo', _repo)
    .define('$tag_bubble', _bubble)
    .define('$tag_keyboard', _keyboard)
    .import(path.join(__dirname, 'css', 'index.styl'));
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
export function foldTag([title, open]: str2, content) {
  _fold = true;
  // @ts-ignore
  return htmlTag('details', { open }, htmlTag('summary', {}, title, false) + hexo.render.renderSync({
    text: content,
    engine: 'markdown'
  }).trim(), false);
}

/**
 * Audio tag
 *
 * Syntax:
 * {% audio src %}
 */
export function audioTag([src]: str) {
  _media = true;
  return htmlTag('div', {class: 'audio'}, '<audio controls preload>' + htmlTag('source', {
    src,
    type: 'audio/mp3'
  }, 'Your browser does not support the audio tag.', false), false);
}

/**
 * Video tag
 *
 * Syntax:
 * {% video src %}
 */
export function videoTag([src]: str) {
  _media = true;
  return htmlTag('div', {class: 'video'}, '<video controls preload>' + htmlTag('source', {
    src,
    type: 'video/mp4'
  }, 'Your browser does not support the video tag.', false), false);
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
export function labelTag([text, cls]: str2) {
  _label = true;
  return htmlTag('span', {class: `hl-label bg-${cls}`}, text, false);
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
export function inlineImgTag([src, title, height]: str3) {
  _inline_img = true;
  return htmlTag('img', {src, title, height, class: 'inline-img'});
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
  return htmlTag('div', {class: 'checkbox ' + style},
    `<input type="checkbox" ${ checked==='unchecked' ? '' : `checked=${checked}` }/>${
    // @ts-ignore
    hexo.render.renderSync({text: content, engine: 'markdown'}).split('\n').join('')
    }`, false);
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
  return htmlTag('div', {class: 'checkbox ' + style},
    `<input type="radio" ${ checked==='unchecked' ? '' : `checked=${checked}` }/>${
    // @ts-ignore
    hexo.render.renderSync({text: content, engine: 'markdown'}).split('\n').join('')
    }`, false);
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
    icon = null;
    cls += ' no-icon';
  }
  // @ts-ignore
  return htmlTag('div', {class: `note ${cls} modern`}, (icon ? htmlTag('i', {class: `solitude ${icon}`}, '', false) : '') + hexo.render.renderSync({
    text: content,
    engine: 'markdown'
  }).trim(), false);
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
  return htmlTag('div', {class: 'timeline'}, htmlTag('span', {class: 'timeline-title'}, title, false) + content, false);
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
  // @ts-ignore
  return htmlTag('div', {class: 'timenode'}, htmlTag('div', {class: 'meta'}, `<p>${time}</p>`, false) + `<div class="body">${hexo.render
    .renderSync({text: content, engine: 'markdown'})
    .split('\n')
    .join('')}</div>`, false);
}

/**
 * Button tag
 *
 * Syntax:
 * {% button 'icon' 'content' 'url' %}
 */
export function buttonTag([icon, content, url]: str3 | str2) {
  _button = true;

  if (url === undefined) {
    url = content;
    content = null;
  }

  const onclickAction = url.startsWith('/')
    ? `pjax.loadUrl('${url}')`
    : `window.open('${url}')`;

  const contentHtml = content ? htmlTag('span', {}, content, false) : '';

  return htmlTag('button', {
    class: 'st-btn',
    onclick: onclickAction
  }, `<i class="solitude ${icon}"></i>${contentHtml}`, false);
}

/**
 * Github card tag
 *
 * Syntax:
 * {% github repo %}
 */
export function githubTag([repo]: str) {
  _repo = true;
  const id = Math.random().toString(36).substr(2, 9);
  return htmlTag('div', {
    class: 'repo-card'
  }, `
  <a class='name-${id} repo-title fancybox' href="https://github.com/${repo}"></a>
  <p class='desc-${id} repo-desc'></p>
  <div class="repo-gist">
    <i class="fas fa-star"></i>
    <span class='star-${id}'></span>
    <i class="fas fa-code-branch"></i>
    <span class='fork-${id}'></span>
  </div>
  <img class='lang-${id} repo-language no-lightbox' />
  <script>
    fetch('https://api.github.com/repos/${repo}')
      .then(res => res.json())
      .then(data => {
        document.querySelector('.name-${id}').innerText = data.name;
        document.querySelector('.desc-${id}').innerText = data.description;
        document.querySelector('.star-${id}').innerText = data.stargazers_count;
        document.querySelector('.fork-${id}').innerText = data.forks_count;
        document.querySelector('.lang-${id}').src = 'https://skillicons.dev/icons?i=' + data.language.toLowerCase();
    });
  </script>
  `
  , false);
}

/**
 * Gitlab card tag
 *
 * Syntax:
 * {% gitlab repo %}
 */
export function gitlabTag([repo]: str) {
  _repo = true;
  const id = Math.random().toString(36).substr(2, 9);
  return htmlTag('div', {
    class: 'repo-card'
  }, `
  <a class='name-${id} repo-title fancybox' href="https://gitlab.com/${repo}"></a>
  <p class='desc-${id} repo-desc'></p>
  <div class="repo-gist">
    <i class="fas fa-star"></i>
    <span class='star-${id}'></span>
    <i class="fas fa-code-branch"></i>
    <span class='fork-${id}'></span>
  </div>
  <img class='lang-${id} repo-language no-lightbox' />
  <script>
    fetch('https://gitlab.com/api/v4/projects/${encodeURIComponent(repo)}')
      .then(res => res.json())
      .then(data => {
        document.querySelector('.name-${id}').innerText = data.name;
        document.querySelector('.desc-${id}').innerText = data.description;
        document.querySelector('.star-${id}').innerText = data.star_count;
        document.querySelector('.fork-${id}').innerText = data.forks_count;
        document.querySelector('.lang-${id}').src = 'https://skillicons.dev/icons?i=' + data.language.toLowerCase();
    });
  </script>
  `
  , false);
}

/**
 * Gitee card tag
 *
 * Syntax:
 * {% gitee repo %}
 */
export function giteeTag([repo]: str) {
  _repo = true;
  const id = Math.random().toString(36).substr(2, 9);
  return htmlTag('div', {
    class: 'repo-card'
  }, `
  <a class='name-${id} repo-title fancybox' href="https://gitee.com/${repo}"></a>
  <p class='desc-${id} repo-desc'></p>
  <div class="repo-gist">
    <i class="fas fa-star"></i>
    <span class='star-${id}'></span>
    <i class="fas fa-code-branch"></i>
    <span class='fork-${id}'></span>
  </div>
  <img class='lang-${id} repo-language no-lightbox' />
  <script>
    fetch('https://gitee.com/api/v5/repos/${repo}')
      .then(res => res.json())
      .then(data => {
        document.querySelector('.name-${id}').innerText = data.name;
        document.querySelector('.desc-${id}').innerText = data.description;
        document.querySelector('.star-${id}').innerText = data.stargazers_count;
        document.querySelector('.fork-${id}').innerText = data.forks_count;
        document.querySelector('.lang-${id}').src = 'https://skillicons.dev/icons?i=' + data.language.toLowerCase();
    });
  </script>
  `
  , false);
}

/**
 * Gitea card tag
 *
 * Syntax:
 * {% gitea server repo %}
 */
export function giteaTag([server, repo]: str2) {
  _repo = true;
  const id = Math.random().toString(36).substr(2, 9);
  return htmlTag('div', {
    class: 'repo-card'
  }, `
  <a class='name-${id} repo-title fancybox' href="${server}/${repo}"></a>
  <p class='desc-${id} repo-desc'></p>
  <div class="repo-gist">
    <i class="fas fa-star"></i>
    <span class='star-${id}'></span>
    <i class="fas fa-code-branch"></i>
    <span class='fork-${id}'></span>
  </div>
  <img class='lang-${id} repo-language no-lightbox' />
  <script>
    fetch('${server}/api/v1/repos/${repo}')
      .then(res => res.json())
      .then(data => {
        document.querySelector('.name-${id}').innerText = data.name;
        document.querySelector('.desc-${id}').innerText = data.description;
        document.querySelector('.star-${id}').innerText = data.stars_count;
        document.querySelector('.fork-${id}').innerText = data.forks_count;
        document.querySelector('.lang-${id}').src = 'https://skillicons.dev/icons?i=' + data.language.toLowerCase();
    });
  </script>
  `
  , false);
}

/**
 * Bubble notation tag
 *
 * Syntax:
 * {% bubble content notation background-color %}
 */
export function bubbleTag([content, notation, color]: str3) {
  _bubble = true;
  if (typeof color === 'undefined')
    color = 'blue';
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    const brightness = 0.5474 * Math.sqrt((r ** 2) + (1.5 * g) ** 2 + (0.6 * b) ** 2); // 亮度计算近似公式
    return htmlTag('span', { class: 'bubble-content' }, content, false) + htmlTag('span', { class: 'bubble-notation' },
      htmlTag('span', {
        class: 'bubble-item',
        style: `background-color:${color}; color: ${brightness > 0.5 ? 'var(--efu-black)' : 'var(--efu-white)'}`
      }, notation, false), false)
  } else {
    return htmlTag('span', { class: 'bubble-content' }, content, false) + htmlTag('span', { class: 'bubble-notation' },
      htmlTag('span', { class: `bubble-item bg-${color}` }, notation, false), false)
  }
}


export function keyboardTag([key]: str) {
  _keyboard = true
  key = key.toLowerCase()
  switch (key) {
    case "enter":
      key += "↵";
      break;
    case "shift":
      key += "⇧";
      break;
    case "windows":
    case "window":
    case "win":
      key = "win"
    case "command":
      key += "⌘";
      break;
    case "option":
      key += "⌥";
      break;
    default:
      break;
  }
  key = key[0].toUpperCase() + key.slice(1)
  return htmlTag("span", {class: "keyboard"}, key, false)
}