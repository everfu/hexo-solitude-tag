import {registerAssets} from './assets';
import {createPluginContext, setCompatibilityContext} from './context';
import {createContentTagHandlers} from './tags/content';
import {createCoreTagHandlers} from './tags/core';
import {createRepositoryTagHandlers} from './tags/repositories';
import type {HexoInstance, TagHandler} from './types';

const registeredInstances = new WeakSet<HexoInstance>();

export function registerTagPlugin(hexo: HexoInstance) {
  const context = createPluginContext(hexo);
  setCompatibilityContext(context);
  if (registeredInstances.has(hexo)) return;

  const handlers = {
    ...createCoreTagHandlers(context),
    ...createContentTagHandlers(context),
    ...createRepositoryTagHandlers()
  };
  const register = (name: string, handler: TagHandler, ends = false) => {
    if (ends) {
      hexo.extend.tag.register(name, handler, {ends: true});
      return;
    }
    hexo.extend.tag.register(name, handler);
  };

  register('youtube', handlers.youtube as TagHandler);
  register('p', handlers.p as TagHandler);
  register('span', handlers.span as TagHandler);
  register('bvideo', handlers.bvideo as TagHandler);
  register('fold', handlers.fold as TagHandler, true);
  register('audio', handlers.audio as TagHandler);
  register('video', handlers.video as TagHandler);
  register('videos', handlers.videos as TagHandler, true);
  register('link', handlers.link as TagHandler);
  register('img', handlers.img as TagHandler);
  register('inline_img', handlers.inline_img as TagHandler);
  register('inlineImg', handlers.inlineImg as TagHandler);
  register('checkbox', handlers.checkbox as TagHandler);
  register('radio', handlers.radio as TagHandler);
  register('note', handlers.note as TagHandler, true);
  register('subnote', handlers.note as TagHandler, true);
  register('timeline', handlers.timeline as TagHandler, true);
  register('timenode', handlers.timenode as TagHandler, true);
  register('button', handlers.button as TagHandler);
  register('btn', handlers.btn as TagHandler);
  register('hideInline', handlers.hideInline as TagHandler);
  register('hideBlock', handlers.hideBlock as TagHandler, true);
  register('hideToggle', handlers.hideToggle as TagHandler, true);
  register('label', handlers.label as TagHandler);
  register('flink', handlers.flink as TagHandler, true);
  register('score', handlers.score as TagHandler, true);
  register('series', handlers.series as TagHandler);
  register('chartjs', handlers.chartjs as TagHandler, true);
  register('github', handlers.github as TagHandler);
  register('gitlab', handlers.gitlab as TagHandler);
  register('gitee', handlers.gitee as TagHandler);
  register('gitea', handlers.gitea as TagHandler);
  register('bubble', handlers.bubble as TagHandler);
  register('keyboard', handlers.keyboard as TagHandler);
  register('spoiler', handlers.spoiler as TagHandler);
  register('card', handlers.card as TagHandler);

  registerAssets(context);
  registeredInstances.add(hexo);
}
