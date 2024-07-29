import Hexo from 'hexo';
import { join } from 'path';
const escapeSwigTag = str => str.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
import { youtubeTag } from '../lib/tags/youtube';

describe('Post', () => {
  const hexo = new Hexo(join(__dirname, 'post_test'));
  hexo.extend.tag.register('youtube', youtubeTag);
  const { post } = hexo;

  before(async () => {
    // Load marked renderer for testing
    await hexo.loadPlugin(require.resolve('hexo-renderer-marked'), () => {});
  });

  // TODO: Should we move this test case to https://github.com/hexojs/hexo/blob/1127f0b85853ffcbe99d9f739500817e4fdc5817/test/scripts/hexo/post.js ?
  it('render() - youtube tag', async () => {
    // Adopted from https://github.com/hexojs/hexo/issues/4087#issuecomment-596999486
    const content = [
      '## Insert',
      '',
      '    {% youtube https://example.com/demo.mp4 %}',
      '',
      'test002',
      '',
      '{% youtube https://example.com/sample.mp4 %}'
    ].join('\n');

    const data = await post.render('', {
      content,
      engine: 'markdown'
    });

    // indented youtube tag
    data.content.trim().should.contains(`<pre><code>${escapeSwigTag('{% youtube https://example.com/demo.mp4 %}')}\n</code></pre>`);
    // youtube tag
    data.content.trim().should.contains('<div class="video-container"><iframe src="https://www.youtube.com/embed/https://example.com/sample.mp4" frameborder="0" loading="lazy" allowfullscreen></iframe></div>');
  });
});
