# Bootstrap verification

Verified in the Work session on 2026-09-11:

- npm installation of pinned mystmd 1.10.1 succeeded.
- MyST parsed both pages and strict site validation completed.
- Static HTML build succeeded after adding the network-interface fallback wrapper.
- Five archive tests passed: deterministic packaging, changed-content revision, tamper detection, symlink rejection, extra-file rejection, and traversal rejection (the first test covers two assertions).
- Generated HTML contains both expected H1 titles, five KaTeX elements on the example page, and the referenced SVG image.
- Source and site archive manifests verified during packaging.

The browser could not open the workspace's localhost URL (ERR_BLOCKED_BY_CLIENT). Visual browser inspection is not verified. GitHub CI and a real Chat-mode publish flow have not run. No hosted builder or public deployment exists yet.

Runtime used for this build: Node 24.19.0, npm 11.9.0, Python 3.12. The CI definition targets Node 22 and Python 3.12; that CI runtime remains to be verified.
