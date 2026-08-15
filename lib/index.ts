import type {HexoInstance} from './types';
import {registerTagPlugin} from './register';

export {registerTagPlugin};
export type {HexoInstance, SolitudeTagConfig} from './types';
export {
  audioTag,
  bvideoTag,
  bubbleTag,
  butterflyButtonTag,
  butterflyInlineImgTag,
  buttonTag,
  cardTag,
  checkboxTag,
  foldTag,
  imgTag,
  inlineImgTag,
  keyboardTag,
  linkTag,
  pTag,
  radioTag,
  spanTag,
  spoilerTag,
  videoTag,
  videosTag,
  youtubeTag
} from './tags/core';
export {
  chartjsTag,
  flinkTag,
  hideBlockTag,
  hideInlineTag,
  hideToggleTag,
  labelTag,
  noteTag,
  scoreTag,
  seriesTag,
  timelineTag,
  timenodeTag
} from './tags/content';
export {giteaTag, giteeTag, githubTag, gitlabTag} from './tags/repositories';

declare const hexo: HexoInstance;

if (typeof hexo !== 'undefined') {
  registerTagPlugin(hexo);
}
