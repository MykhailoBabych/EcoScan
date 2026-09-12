# Security Policy

## Supported versions

EcoScan is not released in versioned builds yet. Security fixes are made on the
`master` branch only.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report them privately through GitHub instead:

1. Open the repository's **Security** tab.
2. Click **Report a vulnerability**.
3. Describe the issue, the affected screen or file, and the steps to reproduce it.

We aim to acknowledge a report within 7 days and to tell you how we plan to fix
it. Once a fix is merged, we are happy to credit you unless you prefer to stay
anonymous.

## Scope

Things we especially want to hear about:

- Leaked secrets or API keys in the repository or its history.
- Ways to read or change another user's profile, scans, or lessons in Supabase
  (for example, missing Row Level Security policies).
- Ways to bypass sign-in or the teacher/student role checks.

## Known limitations

Values prefixed with `EXPO_PUBLIC_` (see `.env.example`) are embedded in the app
bundle and can be read by anyone who inspects the app. The Supabase anon key is
designed to be public and must be protected by Row Level Security. The Google
Vision and Gemini keys should be restricted in the Google Cloud Console; proxying
them through a backend is planned. Reports that only restate this are
out of scope.
