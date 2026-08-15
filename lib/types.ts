import type Hexo from 'hexo';

export interface SolitudeTagConfig {
  note?: {
    style?: string;
  };
  series?: {
    orderBy?: 'title' | 'date';
    order?: 1 | -1;
    number?: boolean;
  };
  cdn?: {
    chartjs?: string;
    abcjs?: string;
  };
}

export interface SolitudeThemeConfig {
  cdn?: {
    chart_js?: string;
  };
  lazyload?: {
    errorimg?: string;
  };
}

export interface PostRecord {
  title?: string;
  path?: string;
  date?: {
    valueOf?: () => number;
  };
  series?: string;
}

export type HexoInstance = Hexo & {
  config: Hexo['config'] & {
    solitude_tag?: SolitudeTagConfig;
  };
  theme?: {
    config?: SolitudeThemeConfig;
  };
};

export interface TagLocals {
  series?: string;
}

export type TagHandler = (this: TagLocals, args: string[], content?: string) => string;

export interface PluginContext {
  readonly hexo: HexoInstance;
  readonly config: SolitudeTagConfig;
  renderMarkdown(content: string): string;
  urlFor(url: string): string;
  warn(message: string): void;
  posts(): PostRecord[];
  nextHideId(): string;
}
