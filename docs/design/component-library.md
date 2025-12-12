# Component Library Usage Guide

**Phase 1.5 Step 3 Complete** - This guide documents the design-system-compliant component library.

## Quick Start

Import components from the barrel export:

```tsx
import { Button, Card, StatusBar, Badge, Icon } from '../components';
```

---

## Components

### Button

**Purpose:** Primary interactive element for actions, navigation, and form submission.

**Features:**
- ✅ 44x44px minimum tap target (WCAG AA)
- ✅ Visible focus rings for keyboard navigation
- ✅ Press animation (scale down on active)
- ✅ 3 semantic variants (primary, danger, secondary)
- ✅ 2 sizes (default 48px, large 56px)
- ✅ Icon support with automatic spacing

**Props:**
```tsx
interface ButtonProps {
  variant?: 'primary' | 'danger' | 'secondary'; // default: 'primary'
  size?: 'default' | 'large';                   // default: 'default'
  fullWidth?: boolean;                          // default: false
  icon?: ReactNode;                             // Optional Lucide icon
  children: ReactNode;                          // Button text/content
  disabled?: boolean;
  onClick?: () => void;
  // ...all standard button HTML attributes
}
```

**Examples:**

```tsx
// Primary action with icon
<Button variant="primary" icon={<Icon name="Swords" />}>
  Attack
</Button>

// Danger action, full width
<Button variant="danger" fullWidth>
  End Combat
</Button>

// Secondary action, large size
<Button variant="secondary" size="large">
  View Character
</Button>

// Disabled state
<Button disabled>
  Out of Uses
</Button>
```

**Color Mapping:**
- `primary` → Blue (`--color-player`)
- `danger` → Red (`--color-enemy`)
- `secondary` → Gray with border

---

### Card

**Purpose:** Container for character panels, enemy status, and grouped content.

**Features:**
- ✅ 2px semantic border (player/enemy/neutral)
- ✅ 12px border radius (design system)
- ✅ Dark background with contrast
- ✅ Flexible padding options

**Props:**
```tsx
interface CardProps {
  variant: 'player' | 'enemy' | 'neutral';     // Required
  padding?: 'default' | 'compact' | 'spacious'; // default: 'default'
  children: ReactNode;
  className?: string;                           // Additional styles
}
```

**Examples:**

```tsx
// Player character card
<Card variant="player">
  <h2 className="font-cinzel font-bold text-h1">Test Fighter</h2>
  <StatusBar current={15} max={20} label="HP" />
  <div className="text-caption mt-2">AC: 18 | BAB: +3</div>
</Card>

// Enemy card with compact padding
<Card variant="enemy" padding="compact">
  <h3 className="font-inter font-semibold">Goblin</h3>
  <StatusBar current={5} max={10} label="HP" showNumbers={false} />
</Card>

// Neutral info card
<Card variant="neutral">
  <p className="font-merriweather text-body">
    You enter a dark cavern. Roll Perception.
  </p>
</Card>
```

**Border Colors:**
- `player` → Blue (`--color-player`)
- `enemy` → Red (`--color-enemy`)
- `neutral` → Gray (`--border-default`)

---

### StatusBar

**Purpose:** Visual HP/resource bars with color-coded percentage thresholds.

**Features:**
- ✅ 8px height (design system)
- ✅ Smooth 300ms transitions (respects reduced motion)
- ✅ Color coding: 75%+ green, 50-74% orange, 0-49% red
- ✅ Optional label and numeric display
- ✅ ARIA progressbar role

**Props:**
```tsx
interface StatusBarProps {
  current: number;       // Current value (e.g., 15)
  max: number;          // Maximum value (e.g., 20)
  label?: string;       // Optional label (e.g., "HP")
  showNumbers?: boolean; // Show "15 / 20"? (default: true)
  className?: string;
}
```

**Examples:**

```tsx
// HP bar with label and numbers
<StatusBar current={15} max={20} label="HP" showNumbers />
// Result: "HP: 15 / 20" with 75% green bar

// Low HP (warning color)
<StatusBar current={8} max={20} label="HP" />
// Result: Orange bar (40%)

// Critical HP (danger color)
<StatusBar current={3} max={20} label="HP" />
// Result: Red bar (15%)

// Resource bar without numbers
<StatusBar current={2} max={3} label="Spell Slots" showNumbers={false} />
// Result: "Spell Slots:" with bar only

// Custom styling
<StatusBar
  current={playerHp}
  max={playerMaxHp}
  label="HP"
  className="mt-2"
/>
```

**Color Thresholds:**
- **75-100%:** Green (`--color-success`)
- **50-74%:** Orange (`--color-warning`)
- **0-49%:** Red (`--color-enemy`)

---

### Badge

**Purpose:** Display active conditions, buffs, and debuffs with duration.

**Features:**
- ✅ Compact inline display
- ✅ Icon support (14px recommended size)
- ✅ Duration indicator with pluralization
- ✅ Semantic colors (green=buff, red=debuff)

**Props:**
```tsx
interface BadgeProps {
  type: 'buff' | 'debuff';  // Required
  icon?: ReactNode;         // Optional icon (Lucide 14px)
  children: ReactNode;      // Badge text
  duration?: number;        // Turns remaining
  className?: string;
}
```

**Examples:**

```tsx
// Buff with icon and duration
<Badge
  type="buff"
  icon={<Icon name="Shield" size={14} />}
  duration={3}
>
  Dodge: +4 AC
</Badge>
// Result: "✓ Dodge: +4 AC (3 turns)" in green

// Debuff with single turn
<Badge type="debuff" duration={1}>
  Off-Balance: -2 attack
</Badge>
// Result: "⚠️ Off-Balance: -2 attack (1 turn)" in red

// Buff without duration
<Badge type="buff">
  Divine Favor: +1 attack/saves
</Badge>
// Result: "Divine Favor: +1 attack/saves" in green

// Multiple badges in a container
<div className="flex flex-wrap gap-1">
  {conditions.map(condition => (
    <Badge
      key={condition.id}
      type={condition.category}
      duration={condition.turnsRemaining}
    >
      {condition.name}: {condition.description}
    </Badge>
  ))}
</div>
```

**Colors:**
- `buff` → Green (`--color-success`)
- `debuff` → Red (`--color-enemy`)

---

### Icon

**Purpose:** Semantic icons from Lucide React library.

**Features:**
- ✅ 24x24px default (design system)
- ✅ Type-safe icon names
- ✅ Fallback to null if invalid name
- ✅ All Lucide props supported

**Props:**
```tsx
interface IconProps extends LucideProps {
  name: keyof typeof icons;  // Type-safe icon name
  size?: number;             // default: 24
  className?: string;        // Tailwind color classes
  // ...all Lucide props
}
```

**Examples:**

```tsx
// Default size (24px)
<Icon name="Swords" className="text-player" />

// Small icon (14px for badges)
<Icon name="Shield" size={14} />

// Large icon (32px)
<Icon name="Heart" size={32} className="text-success" />

// With aria-label (when icon is standalone)
<Icon name="Cross" aria-label="Cleric class" />

// Decorative icon (when text is present)
<Button icon={<Icon name="Swords" aria-hidden="true" />}>
  Attack
</Button>
```

**Common Icons:**
- `Swords` - Fighter/Attack
- `Lock` - Rogue
- `WandSparkles` - Wizard
- `Cross` - Cleric
- `Shield` - Defense/Armor
- `Heart` - Healing/HP
- `Zap` - Magic/Energy

See [Lucide React Icons](https://lucide.dev/icons/) for full list.

---

## Real-World Usage Examples

### Character Status Card

```tsx
<Card variant="player">
  <div className="flex justify-between items-start mb-3">
    <div>
      <h2 className="font-cinzel font-bold text-h1">Test Fighter</h2>
      <p className="text-caption text-text-primary/70">Level 1 Fighter</p>
    </div>
    <Badge type="buff" icon={<Icon name="Shield" size={14} />} duration={1}>
      Dodge: +4 AC
    </Badge>
  </div>

  <StatusBar current={15} max={20} label="HP" className="mb-2" />

  <div className="grid grid-cols-3 gap-2 text-caption">
    <div>AC: <span className="font-semibold">18</span></div>
    <div>BAB: <span className="font-semibold">+3</span></div>
    <div>Saves: <span className="font-semibold">+2/+1/-1</span></div>
  </div>
</Card>
```

### Action Buttons Grid

```tsx
<div className="grid grid-cols-2 gap-3">
  <Button
    variant="primary"
    icon={<Icon name="Swords" />}
    onClick={() => handleAttack()}
  >
    Attack
  </Button>

  <Button
    variant="secondary"
    icon={<Icon name="Shield" />}
    onClick={() => handleDodge()}
    disabled={dodgeUsed}
  >
    Dodge (0/1)
  </Button>

  <Button
    variant="secondary"
    icon={<Icon name="Heart" />}
    onClick={() => handleSecondWind()}
    disabled={secondWindUsed}
  >
    Second Wind
  </Button>

  <Button
    variant="danger"
    icon={<Icon name="X" />}
    onClick={() => handleEndCombat()}
  >
    Flee
  </Button>
</div>
```

### Multiple Conditions Display

```tsx
<div className="mt-3 pt-3 border-t border-player">
  <div className="text-caption font-semibold text-player/70 mb-2">
    Active Effects:
  </div>
  <div className="flex flex-wrap gap-1">
    {activeConditions.map((condition) => (
      <Badge
        key={condition.id}
        type={condition.category}
        duration={condition.turnsRemaining}
      >
        {condition.name}: {condition.description}
      </Badge>
    ))}
  </div>
</div>
```

---

## Design System Alignment

All components follow `docs/design/design-system.md`:

| Requirement | Implementation |
|-------------|---------------|
| Min tap target 44x44px | Button: `min-w-[44px]` + `h-12` (48px) |
| Focus rings | Button: `ring-2 ring-player` on focus-visible |
| Color tokens | All use CSS variables (bg-primary, color-player, etc.) |
| Typography | Inter (UI), Cinzel (titles), Merriweather (body) |
| Spacing | 4px grid via Tailwind spacing tokens |
| Border radius | 12px cards (`rounded-xl`), 8px buttons (`rounded-lg`) |
| Animations | 200-300ms transitions, scale on active |
| Reduced motion | Respects `prefers-reduced-motion` via index.css |
| Mobile-first | All components default to full-width, responsive |

---

## Next Steps (Step 4)

With the component library complete, you can now refactor screens:

1. **CombatScreen** - Replace inline colors/buttons with components
2. **HomeScreen** - Use Button/Card components
3. **CharacterSheetScreen** - Use StatusBar for stats
4. **CharacterCreationScreen** - Use Button for navigation

**Migration pattern:**

```tsx
// Before
<button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Attack
</button>

// After
<Button variant="primary">Attack</Button>
```

```tsx
// Before
<div className="bg-blue-900 border-2 border-blue-500 p-4 rounded-lg">
  {children}
</div>

// After
<Card variant="player">{children}</Card>
```
