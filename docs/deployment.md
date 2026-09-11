# GitHub Pages deployment

## One-time setup

Open https://github.com/luckyrandom/chat-notebook/settings/pages and select **GitHub Actions** under **Build and deployment → Source**. The workflow is already supplied; do not create another template workflow.

After enabling Pages, open Actions → Check notebook and re-run the latest main-branch workflow (or run it manually on main). If the build succeeded and only deployment failed, re-run failed jobs.

The GitHub connection used to prepare this workflow has repository file-write tools but does not expose Pages administration. This setting must be enabled by a repository administrator.

## Behavior

- Pushes to draft branches and pull requests run tests and build HTML without deploying.
- Pushes and merges to main, and manual runs on main, build and deploy automatically.
- Deployment requires a successful build from the same run.
- The job uploads `_build/html` using GitHub's Pages artifact action, then uses `actions/deploy-pages` with Pages and OIDC permissions. No hosting token is stored in this repository.
- `BASE_URL` is `/chat-notebook`, derived from the repository name. A future root custom domain would require changing this value.
- The expected default address is https://luckyrandom.github.io/chat-notebook/. Treat it as live only after the deployment succeeds.

## Authoring and approval

Ask Chat to save drafts on a branch and open a pull request. Ask it to publish when ready; merging into main triggers publication. The repository is public, so draft source is already publicly readable even before website deployment.

This version does not host draft previews and rebuilds on main after merging. Exact-byte promotion of an earlier preview remains future work.

## References

- https://mystmd.org/guide/deployment-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
