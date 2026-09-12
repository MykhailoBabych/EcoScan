# Contributing to EcoScan

Thanks for helping! This guide covers how to set up the project, what we check
before merging, and how changes get reviewed.

## Setup

1. Install [Node.js](https://nodejs.org/) 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your own keys. Never commit `.env`.
4. Start the app:

   ```bash
   npx expo start
   ```

## Before you open a pull request

Run the same checks as CI:

```bash
npm run typecheck
npm test
```

- Add or update tests in `src/**/__tests__/*.test.ts` when you change logic in
  `src/services` (points, levels, planet progress, achievements, quiz).
- If you add a new top-level file or folder, add it to the allow-list in
  `.gitignore`, otherwise git will ignore it.
- Keep secrets out of the code. Read keys from `EXPO_PUBLIC_*` env variables.

## Branches and commits

- Branch from `master` and give the branch a short, descriptive name, for
  example `fix/quiz-score` or `feature/map-filters`.
- Write commit messages that say what changed and why, for example
  `Fix duplicate points for repeated scans`.
- Keep each pull request focused on one change.

## Review process

1. Open a pull request against `master` and describe what changed and how you
   tested it. Screenshots help for UI changes.
2. CI must pass (type check and tests).
3. At least one other maintainer reviews and approves the pull request.
4. A maintainer merges it once review comments are resolved.

## Reporting bugs and security issues

- Bugs and feature ideas: open a GitHub issue with steps to reproduce.
- Security problems: follow [SECURITY.md](SECURITY.md) and report them privately.
