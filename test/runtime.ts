import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import chai from 'chai';
import {JSDOM} from 'jsdom';

const should = chai.should(); // eslint-disable-line
const runtimeSource = readFileSync(join(process.cwd(), 'lib/runtime/client.js'), 'utf8');

const createRuntimeDom = (body: string) => {
  const dom = new JSDOM(`<!doctype html><html><head>
    <script data-hexo-solitude-tag-runtime data-chartjs="https://cdn.example.com/chart.js" data-abcjs="https://cdn.example.com/abc.js"></script>
  </head><body>${body}</body></html>`, {
    runScripts: 'outside-only',
    url: 'https://example.com/'
  });
  const window = dom.window as any;
  window.HTMLCanvasElement.prototype.getContext = function() {
    return {canvas: this};
  };
  return {dom, window};
};

describe('browser runtime', () => {
  it('initializes features once and cleans charts across navigation', async () => {
    const {dom, window} = createRuntimeDom(`
      <button class="tag-hide-button" aria-expanded="false" aria-controls="secret">Show</button>
      <span id="secret" hidden>Secret</span>
      <img id="fallback" src="bad.png" data-fallback="fallback.png">
      <div class="chartjs-container" data-chartjs-id="chart-one">
        <pre class="chartjs-src" hidden>{"type":"bar","options":{"color":{"light-mode":"black","dark-mode":"white"}}}</pre>
      </div>
      <div class="abc-music-sheet" data-params="{}">X:1</div>
      <article class="repo-card" data-repo-provider="github" data-repo-endpoint="https://api.example.com/repo" aria-busy="true">
        <a class="repo-title">Repo</a><p class="repo-desc"></p><span class="repo-stars"></span><span class="repo-forks"></span>
        <img class="repo-language" hidden><span class="repo-status"></span>
      </article>
      <article class="repo-card" data-repo-provider="github" data-repo-endpoint="https://api.example.com/repo" aria-busy="true">
        <a class="repo-title">Repo</a><p class="repo-desc"></p><span class="repo-stars"></span><span class="repo-forks"></span>
        <img class="repo-language" hidden><span class="repo-status"></span>
      </article>`);

    const chartInstances: any[] = [];
    class Chart {
      static defaults: Record<string, unknown> = {};
      canvas: any;
      definition: any;
      destroyed = false;

      constructor(context: {canvas: any}, definition: any) {
        this.canvas = context.canvas;
        this.definition = definition;
        chartInstances.push(this);
      }

      static getChart(canvas: any) {
        return chartInstances.find(instance => instance.canvas === canvas && !instance.destroyed);
      }

      destroy() {
        this.destroyed = true;
      }
    }
    window.Chart = Chart;
    window.ABCJS = {
      renderAbc(element: any) {
        element.innerHTML = '<svg><title>Example score</title><path></path></svg>';
      }
    };
    let fetchCount = 0;
    window.fetch = async () => {
      fetchCount += 1;
      return {
        ok: true,
        json: async () => ({name: 'Loaded', description: 'Description', stargazers_count: 12, forks_count: 3, language: 'TypeScript'})
      };
    };

    window.eval(runtimeSource);
    const runtime = window.__hexoSolitudeTagRuntime;
    await runtime.init();

    chartInstances.length.should.eql(1);
    chartInstances[0].definition.options.color.should.eql('black');
    fetchCount.should.eql(1);
    window.document.querySelectorAll('.repo-card[data-repo-loaded="true"]').length.should.eql(2);
    window.document.querySelector('.repo-title').textContent.should.eql('Loaded');
    const score = window.document.querySelector('.abc-music-sheet');
    score.dataset.rendered.should.eql('true');
    score.querySelector('svg').getAttribute('aria-label').should.eql('Example score');
    should.not.exist(score.querySelector('title'));

    const button = window.document.querySelector('.tag-hide-button');
    button.click();
    button.getAttribute('aria-expanded').should.eql('true');
    window.document.getElementById('secret').hidden.should.eql(false);

    const image = window.document.getElementById('fallback');
    image.dispatchEvent(new window.Event('error'));
    image.getAttribute('src').should.eql('fallback.png');

    window.document.documentElement.dataset.theme = 'dark';
    window.document.dispatchEvent(new window.Event('solitude:themeChange'));
    await new Promise(resolve => setTimeout(resolve, 0));
    chartInstances.length.should.eql(2);
    chartInstances[0].destroyed.should.eql(true);
    chartInstances[1].definition.options.color.should.eql('white');

    window.document.dispatchEvent(new window.Event('solitude:beforeNavigate'));
    chartInstances[1].destroyed.should.eql(true);
    await runtime.init();
    fetchCount.should.eql(1);
    dom.window.close();
  });

  it('retries failed repository requests on the next initialization', async () => {
    const {dom, window} = createRuntimeDom(`<article class="repo-card" data-repo-provider="github" data-repo-endpoint="https://api.example.com/retry" aria-busy="true">
      <a class="repo-title">Repo</a><p class="repo-desc"></p><span class="repo-stars"></span><span class="repo-forks"></span>
      <img class="repo-language" hidden><span class="repo-status"></span>
    </article>`);
    let fetchCount = 0;
    window.fetch = async () => {
      fetchCount += 1;
      if (fetchCount === 1) return {ok: false, status: 503};
      return {ok: true, json: async () => ({name: 'Recovered', stargazers_count: 1, forks_count: 2})};
    };
    const errors: unknown[] = [];
    window.console.error = (...args: unknown[]) => errors.push(args);

    window.eval(runtimeSource);
    const runtime = window.__hexoSolitudeTagRuntime;
    await runtime.init();
    window.document.querySelector('.repo-card').dataset.repoLoaded.should.eql('error');
    await runtime.init();
    window.document.querySelector('.repo-card').dataset.repoLoaded.should.eql('true');
    window.document.querySelector('.repo-title').textContent.should.eql('Recovered');
    fetchCount.should.eql(2);
    errors.length.should.eql(1);
    dom.window.close();
  });

  it('loads optional chart and score libraries only when their markers exist', async () => {
    const {dom, window} = createRuntimeDom('<main>No interactive tags</main>');
    const requested: string[] = [];
    window.Solitude = {
      getScript(url: string) {
        requested.push(url);
        return Promise.resolve();
      }
    };
    window.fetch = async () => ({ok: true, json: async () => ({})});

    window.eval(runtimeSource);
    await window.__hexoSolitudeTagRuntime.init();
    requested.should.deep.equal([]);
    dom.window.close();
  });
});
