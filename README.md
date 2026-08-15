<div align="center">

# Solitude Tag Plugins

![npm package](https://img.shields.io/npm/v/hexo-solitude-tag)
![license](https://img.shields.io/github/license/everfu/hexo-solitude-tag?color=FF5531)
[![Stars](https://img.shields.io/github/stars/everfu/hexo-solitude-tag)](https://github.com/everfu/hexo-solitude-tag/stargazers)
[![NPM all downloads](https://img.shields.io/npm/dy/hexo-solitude-tag?color=white)](https://www.npmjs.com/package/hexo-solitude-tag)

![hexo version](https://img.shields.io/badge/hexo-8.0.0+-blue?logo=hexo&logoColor=white)
![node version](https://img.shields.io/badge/node-20.19.0+-white?logo=node.js&logoColor=white)

![page view](https://komarev.com/ghpvc/?username=hexo-solitude-tag&abbreviated=true)
![JetBrains](https://img.shields.io/badge/jetbrains-support-black?logo=jetbrains)

</div>

# Installation

```sh
npm i hexo-solitude-tag
```

Version 2 requires Hexo 8 and Node.js 20.19 or newer. Sites that still run Hexo 7 or an older Node.js release should remain on `hexo-solitude-tag@1`.

# Usage

Complete examples are available on the [Solitude tag plugin demo](https://solitude-demo.efu.me/p/8f9926b7.html).

## Butterfly compatibility

Starting with `1.1.0`, articles migrated from Butterfly can use these tag plugins without rewriting their Markdown:

| Feature | Tags | Provider |
| --- | --- | --- |
| Note | `note`, `subnote` | `hexo-solitude-tag` |
| Hide content | `hideInline`, `hideBlock`, `hideToggle` | `hexo-solitude-tag` |
| Button | `btn` | `hexo-solitude-tag` |
| Inline image | `inlineImg` | `hexo-solitude-tag` |
| Label | `label` | `hexo-solitude-tag` |
| Timeline | `timeline` | `hexo-solitude-tag` |
| Friend links | `flink` | `hexo-solitude-tag` |
| ABC music notation | `score` | `hexo-solitude-tag` |
| Series | `series` | `hexo-solitude-tag` |
| Chart.js | `chartjs` | `hexo-solitude-tag` |
| Gallery, Mermaid and Tabs | `galleryGroup`, `gallery`, `mermaid`, `tabs` | Solitude theme |

Existing Solitude tags such as `button`, `inline_img`, `timeline` with nested `timenode`, and the previous `note` arguments remain supported.

### Configuration

All settings are optional. Add them to the site `_config.yml` only when the defaults need to be changed:

```yaml
solitude_tag:
  note:
    style: flat # simple / modern / flat / disabled
  series:
    orderBy: title # title / date
    order: 1 # 1 / -1
    number: true
  cdn:
    chartjs: https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.js
    abcjs: https://cdn.jsdelivr.net/npm/abcjs@6.6.4/dist/abcjs-basic-min.js
```

The plugin runtime is emitted as one cacheable site asset instead of being copied into every HTML page. Chart.js and ABCJS are still requested only when the current page uses their tags. The runtime is idempotent, cleans up charts before PJAX navigation, responds to light/dark theme changes, and deduplicates repository API requests.

### Examples

```ejs
{% hideInline Secret text,Click to reveal %}

{% btn https://example.com,Visit,fas fa-link,blue outline %}

{% timeline Releases,blue %}
<!-- timeline v1.0 -->
First release
<!-- endtimeline -->
{% endtimeline %}
```

## YouTube

```ejs
{% youtube video_id [type] [cookie] %}
```

# LICENSE

[MIT](./LICENSE) License @ 2024-PRESENT [伍十七](https://github.com/everfu)
