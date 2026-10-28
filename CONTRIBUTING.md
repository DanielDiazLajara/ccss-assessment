# Contributing

Thanks for your interest in improving the CCSS Self-Assessment Tool. Contributions in English or Spanish are welcome.

## Running locally

There is no build step. Open `index.html` in a browser, or serve the folder with any static server, for example:

```sh
python -m http.server 8000
```

## Guidelines

- **No external requests.** The tool must keep working offline and must not load anything from CDNs or third parties. New libraries go in `vendor/` with their license (see [vendor/README.md](vendor/README.md)).
- **Escape user input.** Anything typed by the user or read from an imported file or share link must go through `esc()` before being inserted into HTML.
- **Both languages.** Every user-facing string lives in `js/i18n.js` and needs an `es` and an `en` entry.
- **Both themes.** Check visual changes in the light and dark themes.
- **Shared logic.** Scores, readiness, gaps and comparison live in `js/analysis.js` and are reused by the report, the PDF and the exports. Do not duplicate calculations.
- Keep the existing code style: plain JavaScript, no frameworks, short comments where the intent is not obvious.

## Changes to the standard data

Control texts in `js/data.js` must match the official CCSS v9.0 published by C4. When proposing a change, link to the official source.

## Pull requests

1. Fork the repository and create a branch.
2. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (`feat:`, `fix:`, `docs:`…).
3. Before opening the PR, go through a full assessment and check the report and every export (PDF, Excel, CSV, JSON).
4. Describe what changed and include screenshots for visual changes.

## Security

Do not report vulnerabilities in public issues; see [SECURITY.md](SECURITY.md).
