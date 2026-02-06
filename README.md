# Handball Season Checks

A compact web app for viewing and analyzing handball season data (DHB).
It provides a small dashboard to search, view, and explore teams, matches, lineups, and tables.

<img src="./public/favicon.svg" alt="Logo" width="160"/>

Short description:
- Displays lineups, standings, schedules, and team details.
- Uses server APIs under `server/api/dhb/*` to fetch and prepare data.

Key features:
- Search for clubs and teams
- View lineups (`lineup`), matches (`games`), standings (`standing`, `table`)
- Bilingual UI (German / English)

Tech stack:
- Nuxt 3 / Vue 3
- TypeScript
- pnpm
- Vitest for tests

Prerequisites
- Node.js 18+ recommended
- pnpm installed

Installation
1. Clone the repository

```bash
git clone <repo-url>
cd handball-season-checks
```
2. Install dependencies

```bash
pnpm install
```

Development
- Start dev server:

```bash
pnpm dev
```

- UI tests / Storybook (if available):

```bash
pnpm test:ui
```

Tests
- Run unit and component tests with Vitest:

```bash
pnpm test
```

Project structure (excerpt)
- `app/` – Nuxt application, pages and components
- `server/api/` – Server endpoints for DHB data
- `tests/` – Test files
- `types/` – TypeScript type definitions

Contributing
Contributions are welcome. Suggestions:
- Open issues for bugs or feature requests
- Create small, focused pull requests

Before creating a PR:
- Fork the repo, create a branch, commit changes, open a PR

License
This project is licensed as described in the `LICENSE` file.

---
If you want further adjustments or a different tone, tell me what to change.
