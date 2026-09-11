# EcoScan

EcoScan is an Expo-based mobile app for learning how to sort waste, find nearby recycling locations, and turn everyday items into something useful again.

The app combines scanning, local educational content, map-based discovery, and profile gamification. It is designed to help users make better recycling decisions in real time while tracking progress over time.

## Screenshots

|                              Map                               |                                 Activity                                 |                                 Eco Quiz                                 |                                    Recycling Guide                                     |
| :------------------------------------------------------------: | :----------------------------------------------------------------------: | :----------------------------------------------------------------------: | :------------------------------------------------------------------------------------: |
| <img src="assets/screenshots/map.PNG" alt="Map" width="220" /> | <img src="assets/screenshots/activity.PNG" alt="Activity" width="220" /> | <img src="assets/screenshots/eco-quiz.PNG" alt="Eco Quiz" width="220" /> | <img src="assets/screenshots/recycling-guide.PNG" alt="Recycling Guide" width="220" /> |

|                                   Planet Health                                    |                                  Leaderboard                                   |                                Profile                                 |
| :--------------------------------------------------------------------------------: | :----------------------------------------------------------------------------: | :--------------------------------------------------------------------: |
| <img src="assets/screenshots/planet-health.PNG" alt="Planet Health" width="220" /> | <img src="assets/screenshots/leaderboard.PNG" alt="Leaderboard" width="220" /> | <img src="assets/screenshots/profile.PNG" alt="Profile" width="220" /> |

## What the app does

- Scans everyday objects and suggests a waste category, recycling advice, and upcycling ideas.
- Shows nearby recycling points, bottle/can return machines, and large stores on a map.
- Provides a learning hub with eco facts, recycling rules, and upcycling inspiration.
- Tracks eco points, scan history, streaks, category stats, and achievement progress.
- Supports onboarding and profile setup before entering the main app.
- Includes lesson features for school and teacher workflows backed by Supabase.

## Main screens

- Map: discovers nearby recycling-related locations using device location.
- Scan: classifies items and returns recycling guidance plus upcycling suggestions.
- Learn: presents curated facts, sorting rules, and reuse ideas.
- Activity: shows recent scan activity and progress.
- Planet: environmental progress and impact views.
- Profile: level, points, scan history, and achievements.
- Settings: app and account options.

## Tech stack

- Expo and React Native
- Expo Router for file-based navigation
- TypeScript
- Supabase for auth and remote data sync
- AsyncStorage for offline/local persistence
- react-native-maps and expo-location for map features
- expo-camera for scanning
- react-native-reanimated for UI motion

## Data and services

- Local profile and scan data are cached on device.
- Supabase is used for sign-in and syncing profiles, lessons, and scan history.
- Upcycling ideas can fall back to built-in suggestions when no Gemini key is configured.
- The app can still function offline for several flows using local storage.

## Project structure

- src/app: route screens and navigation entry points
- src/components: reusable UI components
- src/contexts: app state providers such as profile state
- src/data: static eco learning content
- src/services: storage, profile, lessons, quiz, map, and AI helpers
- src/hooks: theme and color-scheme helpers
- src/constants: shared theme values

## Getting started

1. Install dependencies

   npm install

2. Start the app

   npx expo start

You can then open the app in Expo Go, an emulator, or a development build.

## Notes

- The default route redirects to the map screen.
- The app uses file-based routing under src/app.
- Some features depend on location and camera permissions.
- Optional Gemini support can be enabled with EXPO_PUBLIC_GEMINI_API_KEY.

## Resetting the starter content

If you want to restore the generated starter layout, run:

npm run reset-project

This moves the current starter files into app-example and recreates a blank app directory.
