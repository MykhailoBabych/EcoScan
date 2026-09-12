# EcoScan

[![CI](https://github.com/Kiriesh45/EcoScan/actions/workflows/ci.yml/badge.svg)](https://github.com/Kiriesh45/EcoScan/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

EcoScan is a mobile app that helps people sort waste correctly. Point the camera at an item to learn which bin it belongs in and get ideas for reusing it. You can also find recycling points nearby and watch your own planet grow as you recycle more.

EcoScan was built by a team of four students at a hackathon in Athens in June 2026.

## Screenshots

|                              Map                               |                                 Activity                                 |                                 Eco Quiz                                 |                                    Recycling Guide                                     |
| :------------------------------------------------------------: | :----------------------------------------------------------------------: | :----------------------------------------------------------------------: | :------------------------------------------------------------------------------------: |
| <img src="assets/screenshots/map.PNG" alt="Map" width="220" /> | <img src="assets/screenshots/activity.PNG" alt="Activity" width="220" /> | <img src="assets/screenshots/eco-quiz.PNG" alt="Eco Quiz" width="220" /> | <img src="assets/screenshots/recycling-guide.PNG" alt="Recycling Guide" width="220" /> |

|                                   Planet Health                                    |                                  Leaderboard                                   |                                Profile                                 |
| :--------------------------------------------------------------------------------: | :----------------------------------------------------------------------------: | :--------------------------------------------------------------------: |
| <img src="assets/screenshots/planet-health.PNG" alt="Planet Health" width="220" /> | <img src="assets/screenshots/leaderboard.PNG" alt="Leaderboard" width="220" /> | <img src="assets/screenshots/profile.PNG" alt="Profile" width="220" /> |

## Features

- **Scan:** take a photo of an item and get its waste category, how to recycle it, and AI-generated upcycling ideas.
- **Map:** find recycling points, bottle and can return machines, and large stores near you, with filters.
- **Planet:** your recycling grows a planet through five stages, from a barren world to a living paradise.
- **Activity:** take eco quizzes, read the recycling guide, see achievements, and compete on the leaderboard.
- **Profile:** eco points, levels, scan streaks, statistics by category, and scan history.
- **School mode:** teachers create lessons and students complete them.
- **Offline:** your profile and scans are saved on the device and synced when you sign in.
- **Haptic feedback** for scans, rewards, and achievements.

## Team

| Member | GitHub | What they built |
| --- | --- | --- |
| **Mykhailo Babych** | [@MykhailoBabych](https://github.com/MykhailoBabych) | Project setup and the first camera and profile screens; settings; the Activity tab with achievements and a leaderboard backed by Supabase; choosing personal or school use; teacher–student lessons with Supabase |
| **Anton Opria** | [@reynnello](https://github.com/reynnello) | Map of recycling locations using OpenStreetMap, with filters; upcycling ideas in the scanner; tab icons and SVG support; achievement animations; merging the team's features together; layout fixes, README, and screenshots |
| **Mark Shatalov** | [@Mark-Shatalov](https://github.com/Mark-Shatalov) | Item recognition with Google Cloud Vision; keeping API keys out of the code; more waste categories; the first interactive planet; eco quizzes; the recycling guide |
| **Nazar Kyrychenko** | [@Kiriesh45](https://github.com/Kiriesh45) | Sign-up, onboarding, and saved profiles; eco points and levels; AI upcycling ideas with Gemini; a redesign with shared UI components; planet stages and health; haptic feedback; tests and CI |

## Tech stack

- [Expo](https://expo.dev/) (SDK 54), React Native, and TypeScript
- Expo Router for navigation based on files
- [Supabase](https://supabase.com/) for sign-in, profiles, lessons, and the leaderboard
- AsyncStorage for data saved on the device
- Google Cloud Vision to recognize items
- Google Gemini for upcycling ideas (optional)
- OpenStreetMap (Overpass API), react-native-maps, and expo-location for the map
- expo-camera, expo-haptics, and react-native-reanimated
- Jest (jest-expo) and GitHub Actions for tests and CI

## Getting started

### Requirements

- Node.js 20 or newer
- The [Expo Go](https://expo.dev/go) app, an Android emulator, or an iOS simulator
- A Supabase project and a Google Cloud Vision API key

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file and fill in the keys:

   ```bash
   cp .env.example .env
   ```

   | Variable | Required | Used for |
   | --- | --- | --- |
   | `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public (anon) key |
   | `EXPO_PUBLIC_VISION_API_KEY` | Yes, for scanning | Google Cloud Vision |
   | `EXPO_PUBLIC_GEMINI_API_KEY` | No | AI upcycling ideas. Without it, the app shows built-in ideas instead |

   The app will not start without the two Supabase variables.

3. Set up the database. Run [`supabase/migrations/20260610000000_initial_schema.sql`](supabase/migrations/20260610000000_initial_schema.sql) in the Supabase SQL Editor, or use `supabase db push` with the [Supabase CLI](https://supabase.com/docs/guides/cli). It creates the tables, Row Level Security policies, and the leaderboard and lesson functions.

4. Start the app:

   ```bash
   npx expo start
   ```

   Then open it in Expo Go, an emulator, or a development build. The map and scanner need location and camera permissions.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` / `npm run ios` / `npm run web` | Start on a specific platform |
| `npm test` | Run the unit tests |
| `npm run typecheck` | Check types with TypeScript |
| `npm run lint` | Run the linter |

## Project structure

```
src/
├── app/          Screens (Expo Router routes)
├── components/   Shared UI components
├── constants/    Theme and waste category data
├── contexts/     App state, such as the user profile
├── hooks/        Theme, planet, and eco score hooks
└── services/     Storage, Supabase, scoring, planet, quiz, guide, lessons, AI
    └── __tests__/  Unit tests
supabase/
└── migrations/   Database schema and security policies
```

## Contributing

Pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and review steps. To report a security issue, follow [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
