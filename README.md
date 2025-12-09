# Adventurer RPG

> A single-player narrative RPG with streamlined d20 mechanics

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://vercel.com)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20iOS%20%7C%20Android-blue)](https://capacitorjs.com)

## 🎯 Status: Walking Skeleton ✅

This is a **minimal end-to-end implementation** demonstrating the complete architecture from web to mobile. The walking skeleton proves:

- ✅ React + TypeScript + Vite working together
- ✅ Capacitor integration for iOS/Android deployment
- ✅ Basic d20 combat mechanics functioning
- ✅ State management with Zustand
- ✅ Dice rolling with detailed combat logs
- ✅ Deployed to web (Vercel) and tested on iOS

**What's working:** Single combat encounter (Level 1 Fighter vs Goblin) with turn-based attacks, damage resolution, and victory/defeat conditions.

**What's NOT included yet:** Multiple enemies, character classes with different mechanics, spell system, saving throws, critical hits, story/narrative, world map, character progression.

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open http://localhost:5173 to test the combat system.

### Build for Production

```bash
# Build web app
npm run build

# Preview production build
npm run preview
```

### Mobile Development

```bash
# Build and sync to native platforms
npm run build
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio
npx cap open android
```

---

## 📁 Project Structure

```
adventurer-rpg/
├── src/
│   ├── types/           # TypeScript type definitions
│   │   ├── attributes.ts
│   │   ├── character.ts
│   │   ├── combat.ts
│   │   └── dice.ts
│   ├── utils/           # Utility functions
│   │   ├── dice.ts     # Dice rolling with rpg-dice-roller
│   │   └── combat.ts   # Combat resolution logic
│   ├── stores/          # Zustand state management
│   │   └── combatStore.ts
│   ├── screens/         # Full screen views
│   │   ├── HomeScreen.tsx
│   │   └── CombatScreen.tsx
│   └── App.tsx          # Main app component
├── docs/
│   ├── specs/           # Design specifications
│   └── campaigns/       # Campaign content
├── ios/                 # Native iOS project (Capacitor)
├── android/             # Native Android project (Capacitor)
└── public/              # Static assets
```

---

## 🎮 Features

### Current (Walking Skeleton)

- **d20 Combat System**
  - Turn-based combat with attack rolls (d20 + BAB vs AC)
  - Damage rolls with ability modifiers
  - Hit/miss resolution
  - Victory/defeat conditions

- **Detailed Combat Log**
  - Shows exact dice rolls: `1d20+5: [12]+5 = 17 vs AC 14 - HIT!`
  - Color-coded by actor (player/enemy/system)
  - Turn tracking

- **Character System**
  - Six attributes (STR, DEX, CON, INT, WIS, CHA)
  - Base Attack Bonus (BAB)
  - Armor Class (AC)
  - Hit Points (HP)
  - Saving throws (Fortitude, Reflex, Will)

- **Mobile Support**
  - Runs on iOS and Android via Capacitor
  - Responsive Tailwind CSS UI

### Coming Next (Phase 1)

See `/docs/specs/` for full design specifications.

- Character classes with different abilities
- Spell system for Wizard/Cleric
- Critical hits and fumbles
- Saving throws
- Conditions (poisoned, stunned, etc.)
- Multiple enemy types
- Narrative system

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 + TypeScript 5 |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS v4 |
| **Mobile** | Capacitor 8 (iOS/Android) |
| **State** | Zustand 5 |
| **Dice System** | @dice-roller/rpg-dice-roller |
| **Deployment** | Vercel (web) |

### Why These Choices?

- **Capacitor** - Deploy same codebase to iOS, Android, and web
- **rpg-dice-roller** - Advanced dice notation (`2d20kh1` for advantage, `1d6!` for exploding dice)
- **Zustand** - Lightweight state management, perfect for turn-based game state
- **Tailwind v4** - Rapid UI development with utility classes

---

## 🎲 Dice System

Powered by `@dice-roller/rpg-dice-roller` with advanced notation support:

```typescript
// Basic rolls
roll('1d20+5')        // Attack roll
roll('2d6+3')         // Damage roll

// Advanced mechanics (future-proofed)
rollWithAdvantage(5)   // 2d20kh1+5 (keep highest)
rollWithDisadvantage(5) // 2d20kl1+5 (keep lowest)
roll('1d6!')          // Exploding dice for crits
```

---

## 📱 Deployment

### Web (Vercel)

Automatically deploys on push to `main` branch.

**Live URL:** [Your Vercel URL here]

### iOS

1. Open project in Xcode: `npx cap open ios`
2. Select target device/simulator
3. Press Run (⌘R)

For App Store deployment, see [Capacitor iOS Guide](https://capacitorjs.com/docs/ios).

### Android

1. Open project in Android Studio: `npx cap open android`
2. Select target device/emulator
3. Press Run

For Play Store deployment, see [Capacitor Android Guide](https://capacitorjs.com/docs/android).

---

## 📖 Documentation

- **Design Specs:** `/docs/specs/2025-12-08-design-spec.md`
- **Q&A:** `/docs/specs/2025-12-08-questions-and-answers.md`
- **Campaigns:** `/docs/campaigns/`

---

## 🧪 Testing the Walking Skeleton

1. **Web:** `npm run dev` → http://localhost:5173
2. Click "Start Combat"
3. Click "Attack" repeatedly
4. Observe detailed dice rolls in combat log
5. Combat ends when either HP reaches 0

**Expected behavior:**
- Attack rolls: `1d20+BAB+STR modifier` vs enemy AC
- Damage rolls: `1d8+STR modifier` applied to enemy HP
- Combat log shows exact dice results
- Victory/Defeat screen displays at end

---

## 🚀 Next Steps

**Phase 1: Core d20 Mechanics** (See design spec for details)
- [ ] Implement all character classes (Fighter, Rogue, Wizard, Cleric)
- [ ] Add spell system
- [ ] Implement saving throws
- [ ] Add critical hits/fumbles
- [ ] Create multiple enemy types
- [ ] Implement conditions system

**Phase 2: Narrative System**
- [ ] Story/choice system
- [ ] Campaign progression
- [ ] World map
- [ ] Character advancement

---

## 📝 Development Notes

### Why "Walking Skeleton"?

A **walking skeleton** is the thinnest possible slice that:
1. Exercises the entire architecture end-to-end
2. Proves the tech stack works together
3. Provides foundation for iterative development
4. Can be deployed and tested on all platforms

This implementation validates the architecture before building full features.

### Git Workflow

- **Native folders committed:** `ios/` and `android/` are version controlled (contain customizable config)
- **Generated assets ignored:** `ios/App/App/public/` excluded (synced from `dist/`)
- **Auto-deployment:** Pushing to `main` triggers Vercel deployment

### Code Quality

- TypeScript strict mode enabled
- ESLint configured for React + TypeScript
- Type-safe state management with Zustand
- Separation of concerns: types, utils, stores, screens

---

## 🤝 Contributing

This is a single-player RPG project. See `/docs/specs/` for design vision and upcoming features.

---

## 📜 License

[Your license here]

---

**Built with ⚔️ and 🎲**
