# Component Patterns

This document describes the reusable UI components in `/src/components` and their usage patterns.

## Component Philosophy

Components are designed for:
- **Reusability** - Used across multiple screens
- **Consistency** - Enforces design system (colors, spacing, typography)
- **Accessibility** - WCAG AA compliance (focus states, tap targets, ARIA)
- **Mobile-first** - Touch-friendly with responsive sizing

## Core Components

### Button (`Button.tsx`)

Standardized button component with variants and sizes.

**Props**:
- `variant`: `'primary'` (blue) | `'danger'` (red) | `'secondary'` (gray)
- `size`: `'default'` (48px) | `'large'` (56px)
- `fullWidth`: `boolean` - Stretches to container width
- `icon`: `ReactNode` - Optional Lucide icon
- `children`: Button text content

**Features**:
- Minimum 44x44px tap target (WCAG AA)
- Visible focus ring for keyboard navigation
- Press animation (scale down on active)
- Disabled state styling

**Usage**:
```tsx
import { Button } from '@/components';
import { Swords } from 'lucide-react';

<Button variant="primary" icon={<Swords size={20} />}>
  Attack
</Button>

<Button variant="danger" size="large" fullWidth>
  End Combat
</Button>

<Button variant="secondary" disabled>
  Not Available
</Button>
```

### Card (`Card.tsx`)

Container component for character/enemy status panels and content areas.

**Props**:
- `variant`: `'player'` (blue border) | `'enemy'` (red border) | `'neutral'` (gray border)
- `padding`: `'default'` (16px) | `'compact'` (12px) | `'spacious'` (24px)
- `className`: Optional additional CSS classes
- `children`: Card content

**Features**:
- Full-width responsive
- 2px semantic border based on variant
- 12px border radius
- Dark secondary background

**Usage**:
```tsx
import { Card } from '@/components';

<Card variant="player">
  <h2 className="heading-primary">{character.name}</h2>
  <StatusBar current={character.hp} max={character.maxHp} label="HP" />
</Card>

<Card variant="enemy" padding="compact">
  <span className="body-primary">{enemy.name} - AC {enemy.ac}</span>
</Card>
```

### Badge (`Badge.tsx`)

Displays conditions, buffs, and debuffs with duration tracking.

**Props**:
- `type`: `'buff'` (green) | `'debuff'` (red)
- `icon`: `ReactNode` - Optional Lucide icon
- `duration`: `number` - Optional turn count
- `children`: Badge content (condition name/description)

**Features**:
- Compact inline display
- Icon support with proper spacing
- Duration indicator shows "(N turns)"
- High contrast (white text on colored background)

**Usage**:
```tsx
import { Badge } from '@/components';
import { Shield } from 'lucide-react';

<Badge type="buff" icon={<Shield size={14} />} duration={3}>
  Dodge: +4 AC
</Badge>

<Badge type="debuff" duration={1}>
  Off-Balance: -2 attack
</Badge>
```

### CharacterStatusBar (`CharacterStatusBar.tsx`)

Displays character HP (with visual bar) and gold in compact horizontal layout.

**Props**:
- `character`: `Character` object

**Features**:
- HP bar with color coding (green > 50%, yellow > 25%, red ≤ 25%)
- Smooth transitions on HP changes
- Gold indicator with coin icon
- Responsive layout

**Usage**:
```tsx
import { CharacterStatusBar } from '@/components';

<CharacterStatusBar character={character} />
```

**Where used**: StoryScreen header, showing vital stats during narrative gameplay.

### StatusBar (`StatusBar.tsx`)

Generic status bar for displaying current/max values (HP, spell slots, etc.).

**Props**:
- `current`: `number` - Current value
- `max`: `number` - Maximum value
- `label`: `string` - Label text (e.g., "HP", "Spell Slots")
- `color`: `string` - Optional color class (defaults to player blue)

**Usage**:
```tsx
import { StatusBar } from '@/components';

<StatusBar current={15} max={20} label="HP" />
<StatusBar current={2} max={3} label="Spell Slots" color="bg-magic" />
```

### Icon (`Icon.tsx`)

Wrapper for Lucide React icons with consistent sizing.

**Props**:
- `name`: `string` - Lucide icon name
- `size`: `number` - Icon size in pixels (default: 20)
- `className`: Optional additional CSS classes

**Usage**:
```tsx
import { Icon } from '@/components';

<Icon name="Swords" size={24} />
<Icon name="Heart" className="text-enemy" />
```

### BackButton (`BackButton.tsx`)

Standard back navigation button with icon.

**Props**:
- `onClick`: `() => void` - Click handler
- `label`: `string` - Optional button text (default: "Back")

**Usage**:
```tsx
import { BackButton } from '@/components';

<BackButton onClick={() => navigate({ type: 'home' })} />
<BackButton onClick={handleBack} label="Return to Map" />
```

### OptionsMenu (`OptionsMenu.tsx`)

Dropdown menu for screen options (typically in top-right corner).

**Props**:
- `options`: `Array<{ label: string; onClick: () => void }>` - Menu items

**Usage**:
```tsx
import { OptionsMenu } from '@/components';

<OptionsMenu
  options={[
    { label: 'Character Sheet', onClick: () => navigate({ type: 'characterSheet' }) },
    { label: 'Main Menu', onClick: () => navigate({ type: 'mainMenu' }) },
  ]}
/>
```

## Specialized Component Groups

### Combat Components (`components/combat/`)

Combat-specific UI components:

- **`PrimaryAttackButton.tsx`** - Main attack action button
- **`SecondaryAttackButton.tsx`** - Power Attack variant button
- **`ActionPopupButton.tsx`** - Button that opens action selection popup
- **`ItemsActionButton.tsx`** - Button to use items in combat

These components encapsulate combat-specific logic and styling.

### Narrative Components (`components/narrative/`)

Story/narrative UI components:

- **`ChoiceButton.tsx`** - Button for story choices (handles locked/unlocked states)
- **`NarrativeLog.tsx`** - Displays conversation history with speaker names

## Component Best Practices

### Using Components

1. **Import from index** - Use barrel exports for cleaner imports:
   ```tsx
   import { Button, Card, Badge } from '@/components';
   ```

2. **Always use semantic typography** - Don't override with direct font utilities:
   ```tsx
   // ❌ Bad
   <Button className="font-cinzel text-2xl font-bold">Attack</Button>

   // ✅ Good
   <Button>Attack</Button> // Uses semantic .button-text class
   ```

3. **Respect variant props** - Use semantic variants, not custom colors:
   ```tsx
   // ❌ Bad
   <Button className="bg-purple-500">Magic</Button>

   // ✅ Good
   <Button variant="primary">Magic</Button>
   ```

4. **Compose components** - Build complex UIs from simple components:
   ```tsx
   <Card variant="player">
     <h2 className="heading-secondary">{character.name}</h2>
     <StatusBar current={character.hp} max={character.maxHp} label="HP" />
     <div className="flex gap-2 mt-2">
       <Badge type="buff" duration={3}>Divine Favor</Badge>
       <Badge type="debuff" duration={1}>Off-Balance</Badge>
     </div>
   </Card>
   ```

### Creating New Components

When creating new reusable components:

1. **Place in `/components`** - If used across multiple screens
2. **Place in `/screens`** - If used only within one screen
3. **Use TypeScript interfaces** - Define props with JSDoc comments
4. **Follow accessibility patterns** - Focus states, ARIA labels, keyboard navigation
5. **Use semantic classes** - Reference `src/index.css` for typography
6. **Export from index.ts** - Add to barrel exports for clean imports
7. **Document with examples** - Add usage examples in JSDoc

### Component vs Screen

**Components** (`/components`):
- Reusable UI elements
- No route/navigation logic
- Can be used in multiple screens
- Examples: Button, Card, Badge

**Screens** (`/screens`):
- Full-page views
- Handle navigation and routing
- Use components for UI
- Examples: CombatScreen, StoryScreen, CharacterSheetScreen

## Design System Integration

All components follow the design system defined in `src/index.css`:

- **Colors**: Use CSS variables (`--color-player`, `--color-enemy`, etc.)
- **Typography**: Use semantic classes (`.heading-primary`, `.body-primary`, etc.)
- **Spacing**: Follow 4px grid (`--spacing-1` through `--spacing-8`)
- **Border radius**: 12px for cards (`.rounded-xl`), 8px for buttons (`.rounded-lg`)

When in doubt, reference existing components and `ui/guidelines.md` for design patterns.
