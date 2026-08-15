import {escapeHTML, htmlTag} from 'hexo-util';
import type {PluginContext} from './types';

export {escapeHTML, htmlTag};

export const classNames = (value = '') => value
  .split(/\s+/)
  .filter(name => /^[a-z0-9_-]+$/i.test(name))
  .join(' ');

export const tagClass = (...names: string[]) => classNames(['solitude-tag', ...names].join(' '));

export const parseCommaArgs = (args: string[]) => args
  .join(' ')
  .split(',')
  .map(arg => arg.trim());

export const safeCssValue = (value = '') => {
  return /^[#(),.%\-\w\s]+$/.test(value) ? value : '';
};

export const safeStyleUrl = (context: PluginContext, value: string) => {
  return !value || /["'();<>\\\n\r]/.test(value) ? '' : context.urlFor(value);
};

export const errorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};
