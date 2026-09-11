# Working from Chat

## Instructions to give the assistant

Read README.md and docs/chat-workflow.md in chat-notebook. Draft or edit content in content/, retain approved wording and references, and use the shared theme. Add pages to myst.yml. Check the available tools rather than assuming npm or network access. If builds are available, run npm ci --ignore-scripts, npm run check, and npm run build. Otherwise create a source archive with python3 tools/package.py source and clearly report that MyST validation has not run. Do not publish until I approve the exact preview revision.

## Capability paths

| Available environment | Supported path |
| --- | --- |
| Node + package downloads | Validate and render locally |
| Python only | Package source for another builder |
| Connected GitHub write tool | Commit source to a branch and let CI check it, once installed |
| No execution or repository write | Produce complete file contents for transfer; automatic publishing remains unavailable |

The repository does not add missing capabilities to a Chat model. A real authenticated Chat publishing integration must be tested in the user's intended mode. CI archives alone do not provide a public preview URL.

## Future publishing contract

1. Submit source package to an authenticated builder.
2. Builder verifies inputs, uses the trusted renderer, and returns a preview URL plus artifact revision.
3. User reviews that revision.
4. Publish promotes the same stored bytes; it does not rebuild.
5. Return permanent URL, revision, and rollback target.

A source archive must never supply privileged build commands to a hosted builder. Hosted builds need isolation and a trusted pinned toolchain; this bootstrap's ZIP verifier is not an execution sandbox.
