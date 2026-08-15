import {join} from 'node:path';
import chai from 'chai';
import {load} from 'cheerio';
import Hexo from 'hexo';
import {
  audioTag,
  bvideoTag,
  bubbleTag,
  checkboxTag,
  foldTag,
  giteaTag,
  giteeTag,
  gitlabTag,
  imgTag,
  inlineImgTag,
  keyboardTag,
  linkTag,
  noteTag,
  pTag,
  radioTag,
  registerTagPlugin,
  scoreTag,
  seriesTag,
  spanTag,
  spoilerTag,
  timenodeTag,
  videoTag,
  videosTag
} from '../lib';

const should = chai.should(); // eslint-disable-line

describe('public tag handlers', () => {
  const hexo = new Hexo(join(__dirname, 'tag_rendering'));
  const warnings: string[] = [];

  before(async () => {
    await hexo.loadPlugin(require.resolve('hexo-renderer-marked'), () => {});
    hexo.config.url = 'https://example.com';
    hexo.config.root = '/blog/';
    hexo.config.solitude_tag = {
      note: {style: 'flat'},
      series: {orderBy: 'date', order: -1, number: false}
    };
    hexo.log.warn = (message: string) => warnings.push(message);
    registerTagPlugin(hexo);
    registerTagPlugin(hexo);
  });

  beforeEach(() => {
    warnings.length = 0;
  });

  it('renders media, text and folding tags', () => {
    const bilibili = load(bvideoTag(['BV1demo']));
    bilibili('iframe').attr('loading').should.eql('lazy');
    bilibili('iframe').attr('src').should.contain('BV1demo');

    load(spanTag(['red', 'inline']))('.tag-span.red').text().should.eql('inline');
    load(pTag(['center', 'paragraph']))('.tag-paragraph.center').text().should.eql('paragraph');
    load(foldTag(['Details', 'open'], '**Body**'))('details[open] strong').text().should.eql('Body');
    load(audioTag(['/audio/demo.mp3']))('audio[preload="metadata"] source').attr('src').should.eql('/audio/demo.mp3');
    load(videoTag(['/video/demo.mp4']))('video[preload="metadata"] source').attr('type').should.eql('video/mp4');
    load(videosTag(['3'], '<div class="video"></div>'))('.tag-videos').attr('col').should.eql('3');
  });

  it('renders links and images through the Hexo root', () => {
    const local = load(linkTag(['Docs', 'Guide', '/docs/']));
    local('a').attr('href').should.eql('/blog/docs/');
    should.not.exist(local('a').attr('target'));

    const external = load(linkTag(['External', 'Site', 'https://example.net']));
    external('a').attr('target').should.eql('_blank');
    external('a').attr('rel').should.eql('noopener noreferrer');

    load(imgTag(['/img/demo.png', 'Demo', 'width:10px']))('img').attr('src').should.eql('/blog/img/demo.png');
    load(inlineImgTag(['/img/inline.png', 'Inline', '20']))('.tag-inline-image').attr('height').should.eql('20');
  });

  it('renders choices, notes and nested Markdown content', () => {
    const checked = load(checkboxTag(['green', '**Checked**']));
    checked('input').attr('checked').should.eql('checked');
    checked('.tag-choice-content strong').text().should.eql('Checked');

    const unchecked = load(checkboxTag(['red', 'unchecked', 'No']));
    should.not.exist(unchecked('input').attr('checked'));
    const radio = load(radioTag(['blue', 'unchecked', 'Radio']));
    radio('input[type="radio"]').length.should.eql(1);

    const note = load(noteTag([], 'Plain **note**'));
    note('.note.default.flat.no-icon strong').text().should.eql('note');
    load(timenodeTag(['Today'], '**Done**'))('.tag-timenode strong').text().should.eql('Done');
    load(scoreTag([], 'X:1\nK:C\nCDEF'))('.tag-score').attr('data-params').should.eql('{}');
  });

  it('renders visual helpers across their supported variants', () => {
    const hexBubble = load(bubbleTag(['Term', 'Meaning', '#ffffff']));
    hexBubble('.bubble-item').attr('style').should.contain('var(--efu-black)');
    load(bubbleTag(['Term', 'Meaning', 'purple']))('.bg-purple').length.should.eql(1);

    keyboardTag(['enter']).should.contain('Enter↵');
    keyboardTag(['shift']).should.contain('Shift⇧');
    keyboardTag(['windows']).should.contain('Win⌘');
    keyboardTag(['command']).should.contain('Command⌘');
    keyboardTag(['option']).should.contain('Option⌥');
    keyboardTag(['escape']).should.contain('Escape');
    load(spoilerTag(['black', '<hidden>']))('.spoiler.black-text').text().should.eql('<hidden>');
  });

  it('renders every repository provider safely', () => {
    load(gitlabTag(['group/repo']))('.repo-card').attr('data-repo-endpoint').should.contain('group%2Frepo');
    load(giteeTag(['group/repo']))('.repo-card').attr('data-repo-provider').should.eql('gitee');
    const gitea = load(giteaTag(['https://git.example.com/', 'group/repo']));
    gitea('.repo-card').attr('data-repo-endpoint').should.eql('https://git.example.com/api/v1/repos/group/repo');
    gitea('.repo-title').attr('href').should.eql('https://git.example.com/group/repo');
  });

  it('handles series fallback, ordering and missing data', () => {
    const originalModel = hexo.model.bind(hexo);
    (hexo as any).model = () => ({
      toArray: () => [
        {title: 'Older', path: 'older/', date: {valueOf: () => 1}, series: 'Guide'},
        {title: 'Newer', path: 'newer/', date: {valueOf: () => 2}, series: 'Guide'}
      ]
    });
    const output = load(seriesTag.call({series: 'Guide'}, []));
    output('.series-items').get(0).tagName.should.eql('ul');
    output('.series-items li').first().text().should.eql('Newer');

    seriesTag.call({}, []).should.eql('');
    warnings[0].should.contain('No series specified');
    warnings.length = 0;
    seriesTag.call({}, ['Missing']).should.eql('');
    warnings[0].should.contain('There is no series named');
    (hexo as any).model = originalModel;
  });
});
