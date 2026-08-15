import {escapeHTML, tagClass} from '../helpers';

type RepositoryProvider = 'github' | 'gitlab' | 'gitee' | 'gitea';

const renderRepository = (provider: RepositoryProvider, repo = '', server = '') => {
  const normalizedServer = server.replace(/\/$/, '');
  const providers = {
    github: {label: 'GitHub', base: 'https://github.com', api: 'https://api.github.com/repos/'},
    gitlab: {label: 'GitLab', base: 'https://gitlab.com', api: 'https://gitlab.com/api/v4/projects/'},
    gitee: {label: 'Gitee', base: 'https://gitee.com', api: 'https://gitee.com/api/v5/repos/'},
    gitea: {label: 'Gitea', base: normalizedServer, api: `${normalizedServer}/api/v1/repos/`}
  };
  const meta = providers[provider];
  const encodedRepo = provider === 'gitlab' ? encodeURIComponent(repo) : repo;
  const title = repo.split('/').filter(Boolean).pop() || repo;
  const url = `${meta.base}/${repo}`;

  return `<article class="${tagClass('repo-card', 'tag-repo')}" data-repo-provider="${provider}" data-repo-endpoint="${escapeHTML(meta.api + encodedRepo)}" aria-busy="true">
    <div class="repo-card-header">
      <span class="repo-provider"><i class="fab fa-${provider === 'gitee' || provider === 'gitea' ? 'git-alt' : provider}" aria-hidden="true"></i>${meta.label}</span>
      <img class="repo-language no-lightbox" alt="" loading="lazy" hidden>
    </div>
    <a class="repo-title" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(title)}</a>
    <p class="repo-desc">正在读取仓库信息…</p>
    <div class="repo-card-footer">
      <div class="repo-gist" aria-label="Repository statistics">
        <span><i class="fas fa-star" aria-hidden="true"></i><span class="repo-stars">—</span></span>
        <span><i class="fas fa-code-branch" aria-hidden="true"></i><span class="repo-forks">—</span></span>
      </div>
      <span class="repo-status" role="status">加载中</span>
    </div>
  </article>`;
};

export const createRepositoryTagHandlers = () => ({
  github: ([repo = '']: string[]) => renderRepository('github', repo),
  gitlab: ([repo = '']: string[]) => renderRepository('gitlab', repo),
  gitee: ([repo = '']: string[]) => renderRepository('gitee', repo),
  gitea: ([server = '', repo = '']: string[]) => renderRepository('gitea', repo, server)
});

export function githubTag([repo = '']: string[]) { return renderRepository('github', repo); }
export function gitlabTag([repo = '']: string[]) { return renderRepository('gitlab', repo); }
export function giteeTag([repo = '']: string[]) { return renderRepository('gitee', repo); }
export function giteaTag([server = '', repo = '']: string[]) { return renderRepository('gitea', repo, server); }
