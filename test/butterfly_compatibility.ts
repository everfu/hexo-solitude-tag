import Hexo from 'hexo';
import {join} from 'path';
import {load} from 'cheerio';
import chai from 'chai';
import {
  buttonTag,
  butterflyButtonTag,
  butterflyInlineImgTag,
  cardTag,
  chartjsTag,
  flinkTag,
  githubTag,
  hideBlockTag,
  hideInlineTag,
  hideToggleTag,
  labelTag,
  noteTag,
  registerTagPlugin,
  scoreTag,
  seriesTag,
  timelineTag
} from '../lib';

const should = chai.should(); // eslint-disable-line

describe('Butterfly compatibility', () => {
  const hexo = new Hexo(join(__dirname, 'compatibility_test'));
  const warnings: string[] = [];

  before(async () => {
    await hexo.loadPlugin(require.resolve('hexo-renderer-marked'), () => {});
    hexo.config.url = 'https://example.com';
    hexo.config.root = '/';
    hexo.config.solitude_tag = {
      note: {style: 'flat'},
      series: {orderBy: 'title', order: 1, number: true},
      cdn: {
        chartjs: 'https://cdn.example.com/chart.js',
        abcjs: 'https://cdn.example.com/abc.js'
      }
    };
    hexo.theme = {
      config: {
        lazyload: {errorimg: '/img/error.avif'}
      }
    } as any;
    hexo.log.warn = (message: string) => warnings.push(message);
    registerTagPlugin(hexo);
  });

  beforeEach(() => {
    warnings.length = 0;
  });

  it('supports old and Butterfly note arguments', () => {
    const oldSyntax = load(noteTag(['danger modern', 'fas fa-triangle-exclamation'], '**Danger**'));
    oldSyntax('.note.danger.modern').length.should.eql(1);
    oldSyntax('.note-icon.fa-triangle-exclamation').length.should.eql(1);
    oldSyntax('.note strong').text().should.eql('Danger');

    const butterfly = load(noteTag(['blue', 'fas fa-bullhorn', 'simple'], 'News'));
    butterfly('.note.blue.simple').length.should.eql(1);
    butterfly('.note-icon.fa-bullhorn').length.should.eql(1);
  });

  it('renders accessible hide variants and escapes inline content', () => {
    const inline = load(hideInlineTag(['<script>alert(1)</script>,Show,#123456,#fff']));
    inline('.tag-hide-inline').length.should.eql(1);
    inline('.tag-hide-button').attr('aria-expanded').should.eql('false');
    inline('.tag-hide-content').attr('hidden').should.eql('hidden');
    inline('script').length.should.eql(0);

    const block = load(hideBlockTag(['Details'], '**hidden**'));
    block('.tag-hide-block strong').text().should.eql('hidden');

    const toggle = load(hideToggleTag(['Toggle'], 'content'));
    toggle('.tag-hide-toggle').length.should.eql(1);
  });

  it('renders safe Butterfly buttons, inline images and labels', () => {
    const button = load(butterflyButtonTag(['https://example.com,Open,fas fa-link,blue outline']));
    button('.btn-beautify.blue.outline').length.should.eql(1);
    button('.solitude-tag.tag-button').length.should.eql(1);
    button('.tag-button.has-icon').length.should.eql(1);
    button('a').attr('target').should.eql('_blank');
    button('a').attr('rel').should.eql('noopener noreferrer');

    const image = load(butterflyInlineImgTag(['/img/logo.png', '24px']));
    image('.inline-img').attr('style').should.eql('height:24px');

    const label = load(labelTag(['Hello', 'green']));
    label('.hl-label.green').text().should.eql('Hello');
  });

  it('renders refined button states without duplicate native tooltips', () => {
    const textButton = load(buttonTag(['fas fa-link', 'Open', 'https://example.com']));
    textButton('.st-btn.has-icon:not(.is-icon-only)').length.should.eql(1);
    should.not.exist(textButton('a').attr('aria-label'));
    should.not.exist(textButton('a').attr('title'));

    const iconButton = load(buttonTag(['fas fa-arrow-right', 'https://example.com']));
    iconButton('.st-btn.has-icon.is-icon-only').length.should.eql(1);
    iconButton('a').attr('aria-label').should.eql('打开链接');
    should.not.exist(iconButton('a').attr('title'));

    const butterflyIcon = load(butterflyButtonTag(['https://example.com,,fas fa-star,purple larger']));
    butterflyIcon('.btn-beautify.purple.larger.is-icon-only').length.should.eql(1);
  });

  it('renders 1.0-style hover cards with safe dimensions and links', () => {
    const card = load(cardTag([
      'Solitude,https://example.com,https://example.com/cover.jpg,4.5,A polished theme,fas fa-book,Theme,,'
    ] as any));
    card('.card_box.has-cover.has-action').attr('style').should.contain('width:200px; height:275px');
    card('.card_box').attr('style').should.contain('background-image');
    card('.card_mask.card_info .card_description').text().should.eql('A polished theme');
    card('.card_mask .card_action').text().should.eql('查看详情');
    card('.card_action').attr('rel').should.eql('noopener noreferrer');
    card('.card_content .card_title').text().should.eql('Solitude');

    const compact = load(cardTag(['Untitled,,,0,,,,180px,280px'] as any));
    compact('.card_box.no-cover.no-action').attr('style').should.contain('width:180px; height:280px');
    compact('.card_box').attr('style').should.contain('background-color:#333');
    compact('.card_description').text().should.eql('暂无简介');
    compact('.card_action').length.should.eql(0);
  });

  it('renders repository cards with shared loading state markup', () => {
    const $ = load(githubTag(['everfu/hexo-solitude-tag']));
    $('.repo-card.solitude-tag').attr('aria-busy').should.eql('true');
    $('.repo-card').attr('data-repo-provider').should.eql('github');
    $('.repo-status[role="status"]').text().should.eql('加载中');
    $('script').length.should.eql(0);
  });

  it('supports Butterfly and legacy timeline formats', () => {
    const butterfly = load(timelineTag(['Release,blue'], [
      '<!-- timeline v1.0 -->',
      '**First** release',
      '<!-- endtimeline -->'
    ].join('\n')));
    butterfly('.timeline.blue .headline').length.should.eql(1);
    butterfly('.timeline-item-content strong').text().should.eql('First');

    const legacy = load(timelineTag(['History'], '<div class="timenode">legacy</div>'));
    legacy('.timeline-title').text().should.eql('History');
    legacy('.timenode').text().should.eql('legacy');
  });

  it('renders flink YAML and secures external links', () => {
    const output = flinkTag([], [
      '- class_name: Friends',
      '  class_desc: Good sites',
      '  link_list:',
      '    - name: Example',
      '      link: https://example.com',
      '      avatar: /img/avatar.png',
      '      descr: Example site'
    ].join('\n'));
    const $ = load(output);
    $('.flink-name').text().should.eql('Friends');
    $('.flink-list-item a').attr('rel').should.eql('noopener noreferrer');
    $('.flink-list-item > a > img.flink-avatar').attr('data-fallback').should.eql('/img/error.avif');
    $('.flink-item-info .flink-item-name').text().should.eql('Example');
    $('h1,h2,h3,h4,h5,h6').length.should.eql(0);
  });

  it('warns instead of throwing for malformed flink data', () => {
    const output = flinkTag([], 'not: an-array');
    load(output)('.tag-plugin-error').length.should.eql(1);
    warnings[0].should.contain('flink expects a YAML array');
  });

  it('parses ABCJS parameters and preserves the score', () => {
    const output = scoreTag([], '{"staffwidth": 640}\n------\nX:1\nK:C\nCDEF');
    const $ = load(output);
    $('.abc-music-sheet').attr('data-params').should.eql('{"staffwidth":640}');
    $('.abc-music-sheet').text().should.contain('X:1');

    scoreTag([], '{invalid}\n------\nX:1').should.contain('abc-music-sheet');
    warnings[0].should.contain('Invalid ABCJS parameters');
  });

  it('renders and validates Chart.js blocks', () => {
    const valid = chartjsTag(['70,true,demo-chart'], [
      '<!-- chart -->',
      '{"type":"bar","data":{"labels":["A"],"datasets":[]}}',
      '<!-- endchart -->',
      '<!-- desc -->',
      '**Chart** description',
      '<!-- enddesc -->'
    ].join('\n'));
    const $ = load(valid);
    $('.chartjs-container.chartjs-abreast').attr('data-width').should.eql('70%');
    $('.chartjs-container').attr('data-chartjs-id').should.eql('demo-chart');
    $('.chartjs-desc strong').text().should.eql('Chart');

    load(chartjsTag([], '<!-- chart -->\ninvalid\n<!-- endchart -->'))('.tag-plugin-error').length.should.eql(1);
    warnings[0].should.contain('Invalid Chart.js JSON');
  });

  it('sorts series without requiring a theme setting', () => {
    const originalModel = hexo.model.bind(hexo);
    (hexo as any).model = () => ({
      toArray: () => [
        {title: 'Beta', path: 'beta/', date: {valueOf: () => 2}, series: 'Guide'},
        {title: 'Alpha', path: 'alpha/', date: {valueOf: () => 1}, series: 'Guide'},
        {title: 'Other', path: 'other/', date: {valueOf: () => 3}, series: 'Else'}
      ]
    });
    const $ = load(seriesTag.call({}, ['Guide']));
    $('.series-items').get(0).tagName.should.eql('ol');
    $('.series-items li').first().text().should.eql('Alpha');
    (hexo as any).model = originalModel;
  });

  it('injects precompiled CSS and a cacheable runtime asset once', async () => {
    const freshHexo = new Hexo(join(__dirname, 'css_order_test'));
    registerTagPlugin(freshHexo);
    const themeCss = '@charset "UTF-8";\n.theme-end-marker{color:red}';
    const css = freshHexo.extend.filter.execSync('after_render:css', themeCss, {
      args: [{path: join(process.cwd(), 'source', 'css', 'index.styl')}]
    });
    css.should.contain('.tag-hide-button');
    css.should.contain('.chartjs-container');
    css.should.contain('.solitude-tag.flink .flink-list-item');
    css.should.contain('.solitude-tag.repo-card');
    css.indexOf('.theme-end-marker').should.be.lessThan(css.indexOf('.article-container .solitude-tag'));
    const secondCssPass = freshHexo.extend.filter.execSync('after_render:css', css, {
      args: [{path: join(process.cwd(), 'source', 'css', 'index.styl')}]
    });
    secondCssPass.match(/hexo-solitude-tag/g).length.should.eql(1);

    const html = hexo.extend.filter.execSync('_after_html_render', '<html><body></body></html>');
    html.match(/data-hexo-solitude-tag-runtime/g).length.should.eql(1);
    const $ = load(html);
    const runtime = $('script[data-hexo-solitude-tag-runtime]');
    runtime.attr('src').should.eql('/js/hexo-solitude-tag/runtime.js?v=2.0.0');
    runtime.attr('data-chartjs').should.eql('https://cdn.example.com/chart.js');
    runtime.attr('data-abcjs').should.eql('https://cdn.example.com/abc.js');
    runtime.text().should.eql('');
    const secondPass = hexo.extend.filter.execSync('_after_html_render', html);
    secondPass.match(/data-hexo-solitude-tag-runtime/g).length.should.eql(1);

    const generated = await hexo.extend.generator.get('hexo-solitude-tag-runtime')({} as any) as any;
    generated.path.should.eql('js/hexo-solitude-tag/runtime.js');
    generated.data.should.contain('renderRepositories');
    generated.data.should.contain('solitude:beforeNavigate');
    generated.data.should.contain('titles.forEach(title => title.remove())');
  });

  it('isolates registered handlers between Hexo instances', async () => {
    const first = new Hexo(join(__dirname, 'instance_one'));
    const second = new Hexo(join(__dirname, 'instance_two'));
    await Promise.all([
      first.loadPlugin(require.resolve('hexo-renderer-marked'), () => {}),
      second.loadPlugin(require.resolve('hexo-renderer-marked'), () => {})
    ]);
    first.config.solitude_tag = {note: {style: 'modern'}};
    second.config.solitude_tag = {note: {style: 'simple'}};
    registerTagPlugin(first);
    registerTagPlugin(second);

    const firstOutput = await first.extend.tag.render('{% note danger %}First{% endnote %}');
    const secondOutput = await second.extend.tag.render('{% note danger %}Second{% endnote %}');
    load(firstOutput)('.note.modern').length.should.eql(1);
    load(secondOutput)('.note.simple').length.should.eql(1);
  });
});
