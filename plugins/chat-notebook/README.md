# Chat Notebook Plugin

This directory packages Chat Notebook as a skill-only plugin. It does not declare an MCP server or bundle an app connection.

## Included skills

- `note-taking`: turn conversations, rough thoughts, and source material into durable notes instead of transcript dumps.
- `technical-writing`: write concise technical notes around the distinctive idea or core snippet while keeping supporting evidence accessible.
- `chat-notebook-publisher`: route Chat Notebook repository changes through the canonical repository publishing workflow.

The publisher skill intentionally does not duplicate the full repository workflow. Before changing `luckyrandom/chat-notebook`, it reads `.chatgpt/skills/chat-notebook-publisher/SKILL.md` from the current `main` branch and treats that file as the source of truth.

## External capabilities

The plugin itself is instruction-only. Actual repository reads, writes, pull requests, Actions checks, merges, and deployment verification require a GitHub capability that already has the necessary access. Installing this plugin does not grant GitHub access.

## Distribution

The repository marketplace manifest lives at `.agents/plugins/marketplace.json` and points to this directory. A workspace administrator can import the repository as a GitHub-backed plugin marketplace; after the marketplace is configured, merged updates can be synchronized from the repository.
