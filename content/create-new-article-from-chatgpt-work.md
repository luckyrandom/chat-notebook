---
date: 2026-09-11
title: Create New Article from ChatGPT Work
description: A first-person account of writing, committing, building, and verifying a notebook article from the Work environment.
---

This article was written by the assistant in **ChatGPT Work**, the environment in which this notebook was bootstrapped. It describes the tools available in this particular session and the publishing workflow we established together. It does not assume that every Work session has the same capabilities, or that ordinary Chat lacks them.

The goal is simple: develop an explanation in conversation, save it as a durable document, and return a website link that other people can open. The user should not need to download an archive or run deployment commands.

## What I can actually do in this Work session

I have a temporary filesystem, a shell, Python, Node.js, npm, Git, a connected GitHub plugin, and a browser tool. These are distinct capabilities with different access boundaries.

| Capability | What we observed | What it does not establish |
| --- | --- | --- |
| Local execution | I can edit files and run MyST validation and HTML builds. | The workspace is not permanent storage or the user's computer. |
| GitHub network access | Public Git reads succeeded repeatedly, and cloning worked. | Installed Git does not automatically have credentials for private repositories. |
| npm access | Registry requests and installation of MyST 1.10.1 succeeded. | Every network destination or future session will necessarily work. |
| GitHub plugin | I created repository files and commits, updated branches, and inspected Actions runs. | Repository-writing access does not expose every administrative setting. |
| Browser access | I opened the published notebook and checked its content. | The browser could not open this workspace's local preview address. |

We tested these capabilities instead of inferring them from the word “Work.” In particular, an attempted shell fetch of the private repository failed for lack of credentials, while authenticated repository writes through the GitHub plugin succeeded. The repository was later made public.

A future article from Chat can describe its own tested environment. This account does not claim that Work has better model access or that Chat cannot execute programs.

## Start with a document, not a new application

For this article, the durable source is a MyST Markdown file:

```text
content/create-new-article-from-chatgpt-work.md
```

I first read the current repository instructions, the existing pages, and `myst.yml`. Then I write the article with a title, headings, links, tables, and code examples. MyST supports richer document features when needed, including equations and cross-references, as demonstrated in [the averaging example](example.md).

The repository supplies the shared theme. I do not need to build a separate web application for each note. To make a new page discoverable, I add it to `project.toc` in `myst.yml` and link it from the notebook homepage.

These three changes belong together: the article, the navigation entry, and the homepage link. Approved wording should survive the build; the renderer formats it rather than asking a model to rewrite it.

## Use local tools for an early check

In this Work session I can install the pinned dependencies and run the repository's commands:

```sh
npm ci --ignore-scripts
npm run check
BASE_URL=/chat-notebook npm run build
```

The check command validates MyST site content. The build command generates static HTML under `_build/html`. The base URL matters because this notebook is hosted below `/chat-notebook/`, rather than at the domain root. Without the right prefix, a page may appear while its scripts, styles, or images fail to load.

A successful local build is useful feedback, but it is not publication. Nor does it prove the prose is correct, every external citation is reachable, or the layout is readable. Those require their own review.

During bootstrap, we found an environment-specific failure: MyST's port discovery tried to enumerate network interfaces, and the sandbox rejected that OS query. The repository's `tools/run-myst.cjs` wrapper falls back to loopback discovery for that specific error. It does not grant network permission. With the wrapper, HTML generation succeeded.

## “Upload to GitHub” means commit the source files

For this workflow I use the **GitHub plugin's repository operations**, not a ZIP handoff. Uploading means creating or updating the actual files in `luckyrandom/chat-notebook` and saving them in a Git commit.

For an ordinary draft, I create a descriptive branch from the latest `main`, commit the related files together, and open a pull request. The plugin can perform the equivalent of these Git operations even when shell Git has no authenticated write access.

The details that preserve existing work are important:

- Read the current files before editing them.
- For individual updates, supply the current file's blob SHA so stale edits can be detected.
- For a multi-file commit, build on the existing Git tree so unrelated files remain intact.
- Advance the branch without force. If it has moved, reconcile with the new state.
- Use binary-capable operations for binary images; a text-file operation is not a generic image uploader.

The GitHub commit is the handoff to the builder. The temporary Work filesystem is no longer the only copy.

## What GitHub does on my behalf

The repository's [Check notebook workflow](https://github.com/luckyrandom/chat-notebook/blob/main/.github/workflows/check.yml) reacts to repository events. I do not need to keep a shell running here to serve the published website.

| Event | What GitHub Actions does | Website effect |
| --- | --- | --- |
| Push to a draft branch or open/update a pull request | Install dependencies, run tests, validate MyST, and build HTML | The published site stays unchanged. |
| Merge or commit to `main` | Run the checks and build, upload the Pages artifact, then deploy it | A successful deployment updates the site. |
| Manually run the workflow on `main` | Run the same build-and-deploy path | It can republish the selected main revision. |

GitHub Actions provides the build machine. GitHub Pages hosts the resulting static files. Readers do not need the Work session, npm, or a model to be running.

There was one administrative setup step I could not perform through the available plugin: the repository owner selected **GitHub Actions** as the source under **Settings → Pages**. After that, I reran the failed deployment job and confirmed that the initial notebook was live.

## Publication is a deliberate branch transition

Drafting on a branch does not update the website. Once the user authorizes publication, I can merge the article into `main`, which triggers deployment automatically.

The repository is public, so draft source is also publicly readable. A draft branch separates website publication from editing; it is not a privacy boundary.

This first implementation reviews source in a pull request and rebuilds after merging. It does **not** yet provide a hosted preview for each draft or promote an earlier preview's exact bytes. Those are potential extensions, not capabilities we should imply already exist.

## Verify the published result, not just the upload

I treat verification as a sequence of separate questions:

1. **Was the source saved?** Confirm the article and navigation changes are present in the intended commit.
2. **Was the right revision built?** Find the Actions run for that commit. After a merge, check the resulting `main` commit, not only the draft branch's earlier green check.
3. **Did deployment succeed?** The build and deploy jobs must both pass. A downloadable artifact alone is not a live website.
4. **Does the public URL work?** Open the Pages site, follow its link to the article, and check the title and distinctive content. This catches missing navigation and stale output.
5. **Do the page's features work?** Inspect headings, links, code blocks, tables, and any equations or images. Check a direct article URL as well as navigation from the homepage.

Our first notebook deployment passed these practical checks: the homepage opened, the example link navigated correctly, its equations rendered, and its SVG image loaded. For each subsequent article, including this one, the new deployment still needs to be checked rather than relying on that earlier success.

If something fails, the report should name the stage: source upload, build, deployment, or live-page verification. That is more useful than saying merely “done” or “failed.”

## What the user should receive

At the end of a successful publishing task, I should return the **published article link**, with a brief statement of what was verified. The source commit and workflow run provide supporting evidence when useful.

The repeatable experience is: ask for an article in Work, let the assistant write and save it through GitHub, let Actions build it, and verify the Pages result. Local development tools help me catch problems early; GitHub makes the workflow durable and repeatable beyond this session.

## References and implementation

- [Repository authoring instructions](https://github.com/luckyrandom/chat-notebook/blob/main/docs/chat-workflow.md)
- [Repository deployment setup](https://github.com/luckyrandom/chat-notebook/blob/main/docs/deployment.md)
- [MyST: Deploy to GitHub Pages](https://mystmd.org/guide/deployment-github-pages)
- [GitHub: Custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

The environment observations above come from this Work session on September 11, 2026. The linked repository and product documentation can evolve after publication.
