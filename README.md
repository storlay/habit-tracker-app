# Habit Tracker

A cross-platform mobile habit tracker built with Expo and React Native. Track daily habits, visualize progress with charts, and stay on schedule with local notifications.

## Features

- Create, edit, and complete daily habits
- Statistics screen with charts powered by Victory Native and Skia
- Local reminder notifications via `expo-notifications`
- Offline persistence with AsyncStorage
- Multi-language UI: English, Russian, Spanish, German
- Light and dark mode (system-driven)
- Bottom-tab navigation across Today, Stats, and Settings

## Tech Stack

- **Runtime:** Expo SDK 54, React Native 0.81, React 19
- **Navigation:** `@react-navigation/native` with bottom tabs and native stack
- **State / persistence:** React Context + `@react-native-async-storage/async-storage`
- **Charts:** `victory-native` + `@shopify/react-native-skia`
- **i18n:** `i18next` + `react-i18next` + `expo-localization`
- **Dates:** `date-fns`
- **Language:** TypeScript

## Project Structure

```
src/
├── components/    Reusable UI components
├── constants/     App-wide constants
├── context/       React Context providers
├── hooks/         Custom hooks
├── i18n/          Translations (en, ru, es, de)
├── navigation/    Navigators and routes
├── screens/       Today, Stats, Settings, HabitForm
├── storage/       AsyncStorage adapters
├── utils/         Helpers
└── types.ts       Shared types
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Expo CLI (`npx expo` is sufficient)
- iOS Simulator (Xcode) or Android Emulator (Android Studio)

### Install

```bash
npm install
```

### Run

```bash
npm start          # Start the Expo dev server
npm run ios        # Build and run on iOS
npm run android    # Build and run on Android
npm run web        # Run in the browser
```

## Localization

Translation files live in `src/i18n/resources/`. To add a string:

1. Add the key to `en.json` (the source of truth).
2. Mirror it in `ru.json`, `es.json`, and `de.json`.
3. Use it via the typed `useT` hook from `src/i18n/useT.ts`.

Translation keys are type-checked through module augmentation in `src/i18n/types.d.ts`.

## Quality Checks

```bash
npx tsc --noEmit       # TypeScript
npx expo-doctor        # Expo health check
npm audit              # Security audit
```

The project targets zero deprecation warnings and zero audit vulnerabilities. Use `overrides` in `package.json` to pin modern transitive dependencies when needed.
