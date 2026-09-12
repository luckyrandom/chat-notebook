---
name: chat-notebook-publisher
description: Create, edit, validate, publish, and verify articles in the luckyrandom/chat-notebook repository. Use this skill when the user asks to turn conversation content into a Chat Notebook article, update an existing notebook article, save a draft, publish a draft, or verify that a notebook article was built and deployed correctly.
---

# Chat Notebook Publisher

Use this skill for work on the GitHub repository `luckyrandom/chat-notebook`.

The repository is the source of truth. This file defines the workflow, but repository files may evolve. Before changing anything, inspect the current repository and follow newer repository-specific instructions when they conflict with details written here.

## Core principle

Treat authoring, validation, and publication as separate stages:

1. **Authoring** creates or edits source files in the repository.
2. **Validation** proves the exact committed revision passes the repository's checks.
3. **Publication** is an explicit action that updates `main` and successfully deploys GitHub Pages.
4. **Verification** checks the deployed site itself, not merely the source or build status.

Never call a draft branch "published". Never call a successful build a successful deployment. Never call a source URL or build artifact a hosted preview.

## Read before writing

At the start of a task, inspect the latest relevant repository state. At minimum, read:

- `README.md`
- `docs/chat-workflow.md`
- `myst.yml`
- `.github/workflows/check.yml`
- `content/index.md` when adding a discoverable article
- the article being edited, if one already exists
- one or more nearby articles when their structure is useful

For environment-specific context, these two articles document workflows that have actually been exercised:

- `content/create-new-article-from-chatgpt-chat.md`
- `content/create-new-article-from-chatgpt-work.md`

Do not assume the current Chat, Work, Codex, or other agent environment has the same capabilities described in an older article. Inspect the tools available in the current session and use the narrowest reliable workflow.

## Interpret the user's intent

Use the following default distinction unless the user explicitly says otherwise:

- **Write / create / save / update / draft**: prepare the source on a descriptive branch, open or update a pull request, and validate it. Do **not** merge to `main`.
- **Publish / merge / make live**: this is explicit authorization to merge the intended change to `main` and verify deployment.
- **Verify / check**: inspect the exact revision, its Actions run, and, if already published, the live page.

If the requested article content is already clear from the current conversation, use it directly. Do not ask the user to repeat material that is already available.

## Authoring rules

New articles normally belong under `content/` using a descriptive kebab-case filename, for example:

```text
content/how-something-works.md
```

Use MyST-compatible Markdown and follow existing repository conventions.

A normal article should have frontmatter similar to:

```yaml
---
title: Human Readable Title
description: One concise sentence describing the article.
---
```

Prefer semantic Markdown source over handwritten rendered HTML. Use the repository's shared theme instead of reproducing layout inside each article.

When adding a new article:

1. create the Markdown source under `content/`;
2. add the page to `project.toc` in `myst.yml` without removing existing entries;
3. add an appropriate link from `content/index.md` when the page should be discoverable from the homepage;
4. put article assets under `content/assets/` and reference them with repository-relative paths;
5. preserve existing content and navigation unless the task explicitly changes them.

Do not commit generated output such as `_build/` or `dist/` unless the repository instructions explicitly change to require it.

## Preserve conversation-developed content

When the article is based on content developed with the user in the current conversation:

- preserve conclusions, caveats, examples, equations, and references that materially matter;
- reorganize for readability when useful;
- do not silently replace approved technical claims with weaker generic prose;
- distinguish observations about a particular environment from claims about ChatGPT or GitHub in general;
- prefer durable explanations over transcripts of the conversation unless the user asks for a transcript-like article.

## GitHub workflow

The preferred draft workflow is:

1. inspect the latest `main` revision;
2. create a descriptive branch such as `notes/<slug>` from that revision;
3. read the current versions of every file that will be edited;
4. save all logically related changes;
5. prefer one commit for the article, navigation, and configuration changes when the available GitHub tools make that practical;
6. open a pull request to `main`;
7. validate the exact final branch commit with GitHub Actions.

When editing an existing file through a file-update API, use the current blob SHA so concurrent edits are not silently overwritten.

When low-level Git tree/commit tools are available, base a new tree on the current repository tree so unrelated files are preserved.

Do not force-update branches. If the branch or `main` moves while working, read the new state and reconcile before continuing.

The repository is public, so draft branches and pull requests are not private.

## Environment-specific execution

### Ordinary Chat with the GitHub connector

A local clone, shell Git credentials, local npm installation, and local MyST executable are not required.

Use GitHub repository operations to read and write source. Treat GitHub Actions as the canonical build environment.

### Work, Codex, or another environment with local execution

Local checks are useful when available. Follow the current `README.md`; the repository currently uses commands equivalent to:

```sh
npm ci --ignore-scripts
npm run check
BASE_URL=/chat-notebook npm run build
```

Local success is only an early check. GitHub Actions still validates the committed revision that will be reviewed or published.

Never claim a local check was run unless it was actually run in the current environment.

## Validation

The repository's `Check notebook` GitHub Actions workflow is the canonical committed-revision check.

For a draft, find the workflow run whose head SHA matches the final commit on the branch. Do not rely on an older green run.

A valid draft report should answer:

1. Is the intended source present in the branch?
2. Are the TOC and homepage changes present when required?
3. Did the workflow run for the exact final commit?
4. Did its tests, MyST check, and build succeed?
5. If it failed, was the failure introduced by this change?

When a failure is caused by the change, inspect the failing job or logs, fix the problem, commit the repair, and validate the new exact commit.

If validation cannot be inspected with the available tools, say that it remains unverified.

## Draft previews

Do not invent a rendered preview URL.

The repository currently validates and packages draft builds but deploys GitHub Pages only from `main`. A pull request, source file URL, artifact download, or successful draft build is not the same as a public rendered preview.

If the repository later gains real preview deployments, follow the current workflow rather than this historical limitation.

## Publishing

Only merge to `main` when the user explicitly authorizes publication.

Before merging:

1. confirm the pull request contains the intended final files;
2. confirm the draft's final commit is the revision that was reviewed;
3. confirm required checks are in an acceptable state;
4. avoid merging an unexpectedly changed head revision without inspecting it.

After merging, validation starts again because the published revision is the resulting `main` commit, not necessarily the draft commit SHA.

Check the GitHub Actions run for the resulting `main` commit. The workflow should successfully complete both build and Pages deployment stages.

## Live verification

After a successful deployment, verify the public site itself when the current environment has web access.

Check at least:

- the notebook homepage loads;
- navigation exposes the new article when intended;
- the direct article URL loads;
- the article title is correct;
- at least one distinctive piece of article content is present;
- important images, equations, tables, links, or code blocks render correctly when they are central to the page.

A green deploy job without a live-page check is deployment verification, not full content verification. State which level was actually completed.

## What to return to the user

For a **draft**, return a concise status including:

- article path;
- branch;
- pull request;
- final commit;
- exact Actions result;
- any limitations, especially lack of a rendered draft preview.

For a **published article**, lead with the live article link, then state:

- merge or published commit;
- build/deployment result;
- what was checked on the live page.

Do not make the user infer whether the work is merely saved, validated, deployed, or actually verified live.

## Safety rules for repository integrity

- Never delete unrelated files to simplify a commit.
- Never replace the whole repository tree with only newly generated files.
- Never overwrite a changed file without reconciling the current version.
- Never expose secrets in articles, logs, commits, or configuration.
- Never treat a public draft branch as private storage.
- Never merge merely because CI is green when the user has not authorized publication.
- Never claim a GitHub, build, deployment, or browser action succeeded unless the current session actually observed success.

## Compact reusable procedure

When asked to create a Chat Notebook article, use this procedure:

> Read the current repository instructions and affected files. Turn the conversation content into a MyST article under `content/`, update the TOC and homepage when appropriate, save all related source changes on a descriptive draft branch, open a pull request, and check the `Check notebook` workflow for the exact final commit. Fix errors caused by the change. Do not merge to `main` unless the user explicitly asks to publish. After publication, verify the resulting `main` workflow and the live GitHub Pages article.
