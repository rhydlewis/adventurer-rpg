# Phase 4 UI: Level-Up Screens Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build mobile-first UI screens for the level-up flow (summary, feat selection, skill allocation, spell learning) that integrate with the existing useLevelUpStore.

**Architecture:** Create a main LevelUpScreen that orchestrates the level-up flow, showing stat increases and opening modals for player choices (feats, skills, spells). Each modal is a reusable component that reads/writes to useLevelUpStore. Navigation flows from campaign → level-up → choices → campaign completion.

**Tech Stack:** React, TypeScript, Tailwind CSS, Zustand (useLevelUpStore), React Router, Capacitor (mobile)

---

## Prerequisites

- Phase 4 backend complete ✅
- `useLevelUpStore` with: pendingLevelUp, availableFeats, availableSpells, skillPointsToAllocate, selectedFeat, selectedSpells, allocatedSkillPoints
- `levelUpTrigger` utilities: triggerLevelUp(), completeLevelUp(), isLevelUpInProgress()
- Existing component patterns in `src/components/`
- Existing screen patterns in `src/screens/`

---

## Task 1: LevelUpScreen - Base Structure

**Files:**
- Create: `src/screens/LevelUpScreen.tsx`
- Create: `src/__tests__/screens/LevelUpScreen.test.tsx`

### Step 1: Write the failing test

Create `src/__tests__/screens/LevelUpScreen.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LevelUpScreen } from '../../screens/LevelUpScreen';
import { useLevelUpStore } from '../../stores/levelUpStore';

vi.mock('../../stores/levelUpStore');

describe('LevelUpScreen', () => {
  beforeEach(() => {
    vi.mocked(useLevelUpStore).mockReturnValue({
      pendingLevelUp: {
        oldLevel: 1,
        newLevel: 2,
        hpGained: 8,
        babGained: 1,
        savesGained: { fort: 1, reflex: 0, will: 0 },
        featGained: true,
        skillPoints: 2,
        classFeatures: ['fighter-bonus-feat'],
      },
      levelUpInProgress: true,
      availableFeats: [],
      selectedFeat: null,
      skillPointsToAllocate: 2,
      allocatedSkillPoints: {},
      availableSpells: [],
      selectedSpells: [],
      spellsToSelect: 0,
      triggerLevelUp: vi.fn(),
      completeLevelUp: vi.fn(),
      cancelLevelUp: vi.fn(),
      loadAvailableFeats: vi.fn(),
      selectFeat: vi.fn(),
      allocateSkillPoint: vi.fn(),
      deallocateSkillPoint: vi.fn(),
      loadAvailableSpells: vi.fn(),
      selectSpell: vi.fn(),
      deselectSpell: vi.fn(),
    });
  });

  it('should render level-up summary', () => {
    render(
      <BrowserRouter>
        <LevelUpScreen />
      </BrowserRouter>
    );

    expect(screen.getByText(/Level 2!/i)).toBeInTheDocument();
    expect(screen.getByText(/\+8 HP/i)).toBeInTheDocument();
  });

  it('should redirect if no level-up in progress', () => {
    vi.mocked(useLevelUpStore).mockReturnValue({
      ...vi.mocked(useLevelUpStore)(),
      pendingLevelUp: null,
      levelUpInProgress: false,
    });

    render(
      <BrowserRouter>
        <LevelUpScreen />
      </BrowserRouter>
    );

    // Should not render level-up content
    expect(screen.queryByText(/Level 2!/i)).not.toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- src/__tests__/screens/LevelUpScreen.test.tsx
```

Expected: FAIL - "Cannot find module '../../screens/LevelUpScreen'"

### Step 3: Write minimal implementation

Create `src/screens/LevelUpScreen.tsx`:

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLevelUpStore } from '../stores/levelUpStore';

export function LevelUpScreen() {
  const navigate = useNavigate();
  const { pendingLevelUp, levelUpInProgress } = useLevelUpStore();

  useEffect(() => {
    if (!levelUpInProgress || !pendingLevelUp) {
      navigate('/');
    }
  }, [levelUpInProgress, pendingLevelUp, navigate]);

  if (!pendingLevelUp) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Level {pendingLevelUp.newLevel}!
        </h1>

        <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Stat Increases</h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>HP Gained:</span>
              <span className="text-green-400 font-bold">+{pendingLevelUp.hpGained} HP</span>
            </div>

            {pendingLevelUp.babGained > 0 && (
              <div className="flex justify-between">
                <span>Attack Bonus:</span>
                <span className="text-green-400 font-bold">+{pendingLevelUp.babGained} BAB</span>
              </div>
            )}

            {pendingLevelUp.savesGained.fort > 0 && (
              <div className="flex justify-between">
                <span>Fortitude Save:</span>
                <span className="text-green-400 font-bold">+{pendingLevelUp.savesGained.fort}</span>
              </div>
            )}

            {pendingLevelUp.savesGained.reflex > 0 && (
              <div className="flex justify-between">
                <span>Reflex Save:</span>
                <span className="text-green-400 font-bold">+{pendingLevelUp.savesGained.reflex}</span>
              </div>
            )}

            {pendingLevelUp.savesGained.will > 0 && (
              <div className="flex justify-between">
                <span>Will Save:</span>
                <span className="text-green-400 font-bold">+{pendingLevelUp.savesGained.will}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Run test to verify it passes

```bash
npm test -- src/__tests__/screens/LevelUpScreen.test.tsx
```

Expected: PASS (2 tests)

### Step 5: Commit

```bash
git add src/screens/LevelUpScreen.tsx src/__tests__/screens/LevelUpScreen.test.tsx
git commit -m "feat(ui): add LevelUpScreen base structure with stat display"
```

---

## Task 2: LevelUpScreen - Class Features Display

**Files:**
- Modify: `src/screens/LevelUpScreen.tsx`
- Modify: `src/__tests__/screens/LevelUpScreen.test.tsx`

### Step 1: Write the failing test

Add to `src/__tests__/screens/LevelUpScreen.test.tsx`:

```typescript
it('should display class features gained', () => {
  vi.mocked(useLevelUpStore).mockReturnValue({
    ...vi.mocked(useLevelUpStore)(),
    pendingLevelUp: {
      oldLevel: 2,
      newLevel: 3,
      hpGained: 8,
      babGained: 1,
      savesGained: { fort: 1, reflex: 0, will: 0 },
      featGained: false,
      skillPoints: 2,
      classFeatures: ['weapon-specialization'],
    },
  });

  render(
    <BrowserRouter>
      <LevelUpScreen />
    </BrowserRouter>
  );

  expect(screen.getByText(/Class Features/i)).toBeInTheDocument();
  expect(screen.getByText(/weapon-specialization/i)).toBeInTheDocument();
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- src/__tests__/screens/LevelUpScreen.test.tsx
```

Expected: FAIL - "Unable to find element with text matching /Class Features/i"

### Step 3: Add class features display

In `src/screens/LevelUpScreen.tsx`, add after stat increases section:

```typescript
{pendingLevelUp.classFeatures.length > 0 && (
  <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
    <h2 className="text-2xl font-semibold mb-4">Class Features</h2>
    <ul className="space-y-2">
      {pendingLevelUp.classFeatures.map((featureId) => (
        <li key={featureId} className="flex items-center">
          <span className="text-yellow-400 mr-2">★</span>
          <span className="capitalize">{featureId.replace(/-/g, ' ')}</span>
        </li>
      ))}
    </ul>
  </div>
)}
```

### Step 4: Run test to verify it passes

```bash
npm test -- src/__tests__/screens/LevelUpScreen.test.tsx
```

Expected: PASS (3 tests)

### Step 5: Commit

```bash
git add src/screens/LevelUpScreen.tsx src/__tests__/screens/LevelUpScreen.test.tsx
git commit -m "feat(ui): add class features display to LevelUpScreen"
```

---

## Task 3: FeatSelectionModal - Base Structure

**Files:**
- Create: `src/components/levelUp/FeatSelectionModal.tsx`
- Create: `src/__tests__/components/levelUp/FeatSelectionModal.test.tsx`

### Step 1: Write the failing test

Create `src/__tests__/components/levelUp/FeatSelectionModal.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatSelectionModal } from '../../../components/levelUp/FeatSelectionModal';
import type { Feat } from '../../../types/feat';

describe('FeatSelectionModal', () => {
  const mockFeats: Feat[] = [
    {
      id: 'power_attack',
      name: 'Power Attack',
      description: 'Trade accuracy for damage',
      category: 'offensive',
      type: 'attack_variant',
      prerequisites: {},
      effects: { attackModifier: -2, damageModifier: 4, duration: 'turn' },
    },
    {
      id: 'weapon_focus',
      name: 'Weapon Focus',
      description: 'Gain +1 attack bonus',
      category: 'offensive',
      type: 'passive',
      prerequisites: {},
      effects: { attackModifier: 1, duration: 'permanent' },
    },
  ];

  it('should render available feats', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <FeatSelectionModal
        isOpen={true}
        availableFeats={mockFeats}
        selectedFeatId={null}
        onSelectFeat={onSelect}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Power Attack')).toBeInTheDocument();
    expect(screen.getByText('Weapon Focus')).toBeInTheDocument();
  });

  it('should call onSelectFeat when feat is clicked', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <FeatSelectionModal
        isOpen={true}
        availableFeats={mockFeats}
        selectedFeatId={null}
        onSelectFeat={onSelect}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText('Power Attack'));
    expect(onSelect).toHaveBeenCalledWith('power_attack');
  });

  it('should highlight selected feat', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <FeatSelectionModal
        isOpen={true}
        availableFeats={mockFeats}
        selectedFeatId="power_attack"
        onSelectFeat={onSelect}
        onClose={onClose}
      />
    );

    const powerAttackCard = screen.getByText('Power Attack').closest('div');
    expect(powerAttackCard).toHaveClass('ring-2', 'ring-green-500');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- src/__tests__/components/levelUp/FeatSelectionModal.test.tsx
```

Expected: FAIL - "Cannot find module"

### Step 3: Write minimal implementation

Create `src/components/levelUp/FeatSelectionModal.tsx`:

```typescript
import type { Feat } from '../../types/feat';

interface FeatSelectionModalProps {
  isOpen: boolean;
  availableFeats: Feat[];
  selectedFeatId: string | null;
  onSelectFeat: (featId: string) => void;
  onClose: () => void;
}

export function FeatSelectionModal({
  isOpen,
  availableFeats,
  selectedFeatId,
  onSelectFeat,
  onClose,
}: FeatSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Select a Feat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          {availableFeats.map((feat) => (
            <div
              key={feat.id}
              onClick={() => onSelectFeat(feat.id)}
              className={`
                bg-gray-700 rounded-lg p-4 cursor-pointer
                hover:bg-gray-600 transition-colors
                ${selectedFeatId === feat.id ? 'ring-2 ring-green-500' : ''}
              `}
            >
              <h3 className="text-xl font-semibold text-white mb-2">{feat.name}</h3>
              <p className="text-gray-300 text-sm mb-2">{feat.description}</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                  {feat.category}
                </span>
                <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                  {feat.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {availableFeats.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No feats available
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 4: Run test to verify it passes

```bash
npm test -- src/__tests__/components/levelUp/FeatSelectionModal.test.tsx
```

Expected: PASS (3 tests)

### Step 5: Commit

```bash
git add src/components/levelUp/FeatSelectionModal.tsx src/__tests__/components/levelUp/FeatSelectionModal.test.tsx
git commit -m "feat(ui): add FeatSelectionModal component"
```

---

## Task 4: SkillAllocationModal - Base Structure

**Files:**
- Create: `src/components/levelUp/SkillAllocationModal.tsx`
- Create: `src/__tests__/components/levelUp/SkillAllocationModal.test.tsx`

### Step 1: Write the failing test

Create `src/__tests__/components/levelUp/SkillAllocationModal.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillAllocationModal } from '../../../components/levelUp/SkillAllocationModal';
import type { SkillName, SkillRanks } from '../../../types/skill';

describe('SkillAllocationModal', () => {
  const mockCurrentSkills: SkillRanks = {
    Athletics: 2,
    Stealth: 1,
    Perception: 0,
    Arcana: 0,
    Medicine: 0,
    Intimidate: 1,
  };

  const mockAllocated: Partial<SkillRanks> = {
    Athletics: 1,
    Perception: 1,
  };

  it('should display skill points remaining', () => {
    const onAllocate = vi.fn();
    const onDeallocate = vi.fn();
    const onClose = vi.fn();

    render(
      <SkillAllocationModal
        isOpen={true}
        skillPointsToAllocate={4}
        currentSkills={mockCurrentSkills}
        allocatedSkillPoints={mockAllocated}
        onAllocateSkillPoint={onAllocate}
        onDeallocateSkillPoint={onDeallocate}
        onClose={onClose}
      />
    );

    // 4 total - 2 allocated = 2 remaining
    expect(screen.getByText(/2 \/ 4 Points Remaining/i)).toBeInTheDocument();
  });

  it('should show current and new skill values', () => {
    const onAllocate = vi.fn();
    const onDeallocate = vi.fn();
    const onClose = vi.fn();

    render(
      <SkillAllocationModal
        isOpen={true}
        skillPointsToAllocate={4}
        currentSkills={mockCurrentSkills}
        allocatedSkillPoints={mockAllocated}
        onAllocateSkillPoint={onAllocate}
        onDeallocateSkillPoint={onDeallocate}
        onClose={onClose}
      />
    );

    // Athletics: 2 current + 1 allocated = 3 new
    expect(screen.getByText(/Athletics/i)).toBeInTheDocument();
    expect(screen.getByText(/2 → 3/i)).toBeInTheDocument();
  });

  it('should call onAllocateSkillPoint when + is clicked', () => {
    const onAllocate = vi.fn();
    const onDeallocate = vi.fn();
    const onClose = vi.fn();

    render(
      <SkillAllocationModal
        isOpen={true}
        skillPointsToAllocate={4}
        currentSkills={mockCurrentSkills}
        allocatedSkillPoints={{}}
        onAllocateSkillPoint={onAllocate}
        onDeallocateSkillPoint={onDeallocate}
        onClose={onClose}
      />
    );

    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]); // Click first + button

    expect(onAllocate).toHaveBeenCalled();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- src/__tests__/components/levelUp/SkillAllocationModal.test.tsx
```

Expected: FAIL - "Cannot find module"

### Step 3: Write minimal implementation

Create `src/components/levelUp/SkillAllocationModal.tsx`:

```typescript
import type { SkillName, SkillRanks } from '../../types/skill';

interface SkillAllocationModalProps {
  isOpen: boolean;
  skillPointsToAllocate: number;
  currentSkills: SkillRanks;
  allocatedSkillPoints: Partial<SkillRanks>;
  onAllocateSkillPoint: (skill: SkillName) => void;
  onDeallocateSkillPoint: (skill: SkillName) => void;
  onClose: () => void;
}

export function SkillAllocationModal({
  isOpen,
  skillPointsToAllocate,
  currentSkills,
  allocatedSkillPoints,
  onAllocateSkillPoint,
  onDeallocateSkillPoint,
  onClose,
}: SkillAllocationModalProps) {
  if (!isOpen) return null;

  const totalAllocated = Object.values(allocatedSkillPoints).reduce(
    (sum, points) => sum + (points || 0),
    0
  );
  const pointsRemaining = skillPointsToAllocate - totalAllocated;

  const skills: SkillName[] = [
    'Athletics',
    'Stealth',
    'Perception',
    'Arcana',
    'Medicine',
    'Intimidate',
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-white">Allocate Skill Points</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="text-lg text-green-400 font-semibold">
            {pointsRemaining} / {skillPointsToAllocate} Points Remaining
          </p>
        </div>

        <div className="p-4 space-y-3">
          {skills.map((skill) => {
            const current = currentSkills[skill] || 0;
            const allocated = allocatedSkillPoints[skill] || 0;
            const newValue = current + allocated;

            return (
              <div
                key={skill}
                className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{skill}</h3>
                  <p className="text-sm text-gray-400">
                    {allocated > 0 ? (
                      <span className="text-green-400">
                        {current} → {newValue}
                      </span>
                    ) : (
                      <span>{current}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onDeallocateSkillPoint(skill)}
                    disabled={allocated === 0}
                    className="w-10 h-10 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-bold text-xl"
                  >
                    −
                  </button>

                  <span className="w-8 text-center text-white font-bold">
                    {allocated > 0 ? `+${allocated}` : '0'}
                  </span>

                  <button
                    onClick={() => onAllocateSkillPoint(skill)}
                    disabled={pointsRemaining === 0}
                    className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Run test to verify it passes

```bash
npm test -- src/__tests__/components/levelUp/SkillAllocationModal.test.tsx
```

Expected: PASS (3 tests)

### Step 5: Commit

```bash
git add src/components/levelUp/SkillAllocationModal.tsx src/__tests__/components/levelUp/SkillAllocationModal.test.tsx
git commit -m "feat(ui): add SkillAllocationModal component"
```

---

## Task 5: SpellSelectionModal - Base Structure

**Files:**
- Create: `src/components/levelUp/SpellSelectionModal.tsx`
- Create: `src/__tests__/components/levelUp/SpellSelectionModal.test.tsx`

### Step 1: Write the failing test

Create `src/__tests__/components/levelUp/SpellSelectionModal.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpellSelectionModal } from '../../../components/levelUp/SpellSelectionModal';
import type { Spell } from '../../../types/spell';

describe('SpellSelectionModal', () => {
  const mockSpells: Spell[] = [
    {
      id: 'magic_missile',
      name: 'Magic Missile',
      level: 1,
      school: 'evocation',
      target: 'single',
      effect: { type: 'damage', damageDice: '1d4+1', damageType: 'force' },
      description: 'Unerring magical projectiles',
    },
    {
      id: 'shield',
      name: 'Shield',
      level: 1,
      school: 'abjuration',
      target: 'self',
      effect: { type: 'buff', buffType: 'ac', buffAmount: 4, buffDuration: 1 },
      description: 'Invisible barrier grants +4 AC',
    },
  ];

  it('should display available spells', () => {
    const onSelect = vi.fn();
    const onDeselect = vi.fn();
    const onClose = vi.fn();

    render(
      <SpellSelectionModal
        isOpen={true}
        availableSpells={mockSpells}
        selectedSpellIds={[]}
        spellsToSelect={1}
        onSelectSpell={onSelect}
        onDeselectSpell={onDeselect}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    expect(screen.getByText('Shield')).toBeInTheDocument();
  });

  it('should show selection count', () => {
    const onSelect = vi.fn();
    const onDeselect = vi.fn();
    const onClose = vi.fn();

    render(
      <SpellSelectionModal
        isOpen={true}
        availableSpells={mockSpells}
        selectedSpellIds={['magic_missile']}
        spellsToSelect={2}
        onSelectSpell={onSelect}
        onDeselectSpell={onDeselect}
        onClose={onClose}
      />
    );

    expect(screen.getByText(/1 \/ 2 Spells Selected/i)).toBeInTheDocument();
  });

  it('should highlight selected spells', () => {
    const onSelect = vi.fn();
    const onDeselect = vi.fn();
    const onClose = vi.fn();

    render(
      <SpellSelectionModal
        isOpen={true}
        availableSpells={mockSpells}
        selectedSpellIds={['magic_missile']}
        spellsToSelect={2}
        onSelectSpell={onSelect}
        onDeselectSpell={onDeselect}
        onClose={onClose}
      />
    );

    const magicMissileCard = screen.getByText('Magic Missile').closest('div');
    expect(magicMissileCard).toHaveClass('ring-2', 'ring-green-500');
  });

  it('should toggle spell selection on click', () => {
    const onSelect = vi.fn();
    const onDeselect = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(
      <SpellSelectionModal
        isOpen={true}
        availableSpells={mockSpells}
        selectedSpellIds={[]}
        spellsToSelect={2}
        onSelectSpell={onSelect}
        onDeselectSpell={onDeselect}
        onClose={onClose}
      />
    );

    // Click to select
    fireEvent.click(screen.getByText('Magic Missile'));
    expect(onSelect).toHaveBeenCalledWith('magic_missile');

    // Simulate selection
    rerender(
      <SpellSelectionModal
        isOpen={true}
        availableSpells={mockSpells}
        selectedSpellIds={['magic_missile']}
        spellsToSelect={2}
        onSelectSpell={onSelect}
        onDeselectSpell={onDeselect}
        onClose={onClose}
      />
    );

    // Click to deselect
    fireEvent.click(screen.getByText('Magic Missile'));
    expect(onDeselect).toHaveBeenCalledWith('magic_missile');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- src/__tests__/components/levelUp/SpellSelectionModal.test.tsx
```

Expected: FAIL - "Cannot find module"

### Step 3: Write minimal implementation

Create `src/components/levelUp/SpellSelectionModal.tsx`:

```typescript
import type { Spell } from '../../types/spell';

interface SpellSelectionModalProps {
  isOpen: boolean;
  availableSpells: Spell[];
  selectedSpellIds: string[];
  spellsToSelect: number;
  onSelectSpell: (spellId: string) => void;
  onDeselectSpell: (spellId: string) => void;
  onClose: () => void;
}

export function SpellSelectionModal({
  isOpen,
  availableSpells,
  selectedSpellIds,
  spellsToSelect,
  onSelectSpell,
  onDeselectSpell,
  onClose,
}: SpellSelectionModalProps) {
  if (!isOpen) return null;

  const handleSpellClick = (spellId: string) => {
    if (selectedSpellIds.includes(spellId)) {
      onDeselectSpell(spellId);
    } else {
      onSelectSpell(spellId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-white">Learn Spells</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="text-lg text-green-400 font-semibold">
            {selectedSpellIds.length} / {spellsToSelect} Spells Selected
          </p>
        </div>

        <div className="p-4 space-y-3">
          {availableSpells.map((spell) => {
            const isSelected = selectedSpellIds.includes(spell.id);

            return (
              <div
                key={spell.id}
                onClick={() => handleSpellClick(spell.id)}
                className={`
                  bg-gray-700 rounded-lg p-4 cursor-pointer
                  hover:bg-gray-600 transition-colors
                  ${isSelected ? 'ring-2 ring-green-500' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-white">{spell.name}</h3>
                  {isSelected && (
                    <span className="text-green-400 text-2xl">✓</span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-2">{spell.description}</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                    Level {spell.level}
                  </span>
                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300 capitalize">
                    {spell.school}
                  </span>
                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300 capitalize">
                    {spell.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {availableSpells.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No spells available to learn
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 4: Run test to verify it passes

```bash
npm test -- src/__tests__/components/levelUp/SpellSelectionModal.test.tsx
```

Expected: PASS (4 tests)

### Step 5: Commit

```bash
git add src/components/levelUp/SpellSelectionModal.tsx src/__tests__/components/levelUp/SpellSelectionModal.test.tsx
git commit -m "feat(ui): add SpellSelectionModal component"
```

---

## Task 6: LevelUpScreen - Integrate Modals

**Files:**
- Modify: `src/screens/LevelUpScreen.tsx`
- Modify: `src/__tests__/screens/LevelUpScreen.test.tsx`

### Step 1: Write the failing test

Add to `src/__tests__/screens/LevelUpScreen.test.tsx`:

```typescript
it('should open feat selection modal when feat button clicked', () => {
  vi.mocked(useLevelUpStore).mockReturnValue({
    ...vi.mocked(useLevelUpStore)(),
    pendingLevelUp: {
      ...vi.mocked(useLevelUpStore)().pendingLevelUp,
      featGained: true,
    },
    availableFeats: [
      {
        id: 'power_attack',
        name: 'Power Attack',
        description: 'Trade accuracy for damage',
        category: 'offensive',
        type: 'attack_variant',
        prerequisites: {},
        effects: { attackModifier: -2, damageModifier: 4, duration: 'turn' },
      },
    ],
  });

  render(
    <BrowserRouter>
      <LevelUpScreen />
    </BrowserRouter>
  );

  const selectFeatButton = screen.getByText(/Select Feat/i);
  fireEvent.click(selectFeatButton);

  expect(screen.getByText('Power Attack')).toBeInTheDocument();
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- src/__tests__/screens/LevelUpScreen.test.tsx
```

Expected: FAIL - "Unable to find element with text /Select Feat/i"

### Step 3: Add modal integration

Update `src/screens/LevelUpScreen.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLevelUpStore } from '../stores/levelUpStore';
import { FeatSelectionModal } from '../components/levelUp/FeatSelectionModal';
import { SkillAllocationModal } from '../components/levelUp/SkillAllocationModal';
import { SpellSelectionModal } from '../components/levelUp/SpellSelectionModal';
import { useCharacterStore } from '../stores/characterStore';

export function LevelUpScreen() {
  const navigate = useNavigate();
  const {
    pendingLevelUp,
    levelUpInProgress,
    availableFeats,
    selectedFeat,
    skillPointsToAllocate,
    allocatedSkillPoints,
    availableSpells,
    selectedSpells,
    spellsToSelect,
    loadAvailableFeats,
    selectFeat,
    allocateSkillPoint,
    deallocateSkillPoint,
    loadAvailableSpells,
    selectSpell,
    deselectSpell,
  } = useLevelUpStore();

  const { character } = useCharacterStore();

  const [showFeatModal, setShowFeatModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showSpellModal, setShowSpellModal] = useState(false);

  useEffect(() => {
    if (!levelUpInProgress || !pendingLevelUp) {
      navigate('/');
    }
  }, [levelUpInProgress, pendingLevelUp, navigate]);

  useEffect(() => {
    if (pendingLevelUp?.featGained) {
      loadAvailableFeats();
    }
    if (spellsToSelect > 0) {
      loadAvailableSpells();
    }
  }, [pendingLevelUp, spellsToSelect, loadAvailableFeats, loadAvailableSpells]);

  if (!pendingLevelUp || !character) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Level {pendingLevelUp.newLevel}!
        </h1>

        {/* Stat Increases */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Stat Increases</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>HP Gained:</span>
              <span className="text-green-400 font-bold">+{pendingLevelUp.hpGained} HP</span>
            </div>
            {pendingLevelUp.babGained > 0 && (
              <div className="flex justify-between">
                <span>Attack Bonus:</span>
                <span className="text-green-400 font-bold">+{pendingLevelUp.babGained} BAB</span>
              </div>
            )}
            {pendingLevelUp.savesGained.fort > 0 && (
              <div className="flex justify-between">
                <span>Fortitude Save:</span>
                <span className="text-green-400 font-bold">+{pendingLevelUp.savesGained.fort}</span>
              </div>
            )}
            {pendingLevelUp.savesGained.reflex > 0 && (
              <div className="flex justify-between">
                <span>Reflex Save:</span>
                <span className="text-green-400 font-bold">+{pendingLevelUp.savesGained.reflex}</span>
              </div>
            )}
            {pendingLevelUp.savesGained.will > 0 && (
              <div className="flex justify-between">
                <span>Will Save:</span>
                <span className="text-green-400 font-bold">+{pendingLevelUp.savesGained.will}</span>
              </div>
            )}
          </div>
        </div>

        {/* Class Features */}
        {pendingLevelUp.classFeatures.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Class Features</h2>
            <ul className="space-y-2">
              {pendingLevelUp.classFeatures.map((featureId) => (
                <li key={featureId} className="flex items-center">
                  <span className="text-yellow-400 mr-2">★</span>
                  <span className="capitalize">{featureId.replace(/-/g, ' ')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Choices Section */}
        <div className="space-y-4 mb-6">
          {/* Feat Selection */}
          {pendingLevelUp.featGained && (
            <button
              onClick={() => setShowFeatModal(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-between"
            >
              <span>
                {selectedFeat ? '✓ Feat Selected' : 'Select Feat'}
              </span>
              <span className="text-2xl">→</span>
            </button>
          )}

          {/* Skill Allocation */}
          {pendingLevelUp.skillPoints > 0 && (
            <button
              onClick={() => setShowSkillModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-between"
            >
              <span>
                Allocate Skills ({Object.values(allocatedSkillPoints).reduce((sum, p) => sum + (p || 0), 0)}/{skillPointsToAllocate})
              </span>
              <span className="text-2xl">→</span>
            </button>
          )}

          {/* Spell Selection */}
          {spellsToSelect > 0 && (
            <button
              onClick={() => setShowSpellModal(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-between"
            >
              <span>
                Learn Spells ({selectedSpells.length}/{spellsToSelect})
              </span>
              <span className="text-2xl">→</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <FeatSelectionModal
        isOpen={showFeatModal}
        availableFeats={availableFeats}
        selectedFeatId={selectedFeat}
        onSelectFeat={(featId) => {
          selectFeat(featId);
          setShowFeatModal(false);
        }}
        onClose={() => setShowFeatModal(false)}
      />

      <SkillAllocationModal
        isOpen={showSkillModal}
        skillPointsToAllocate={skillPointsToAllocate}
        currentSkills={character.skills}
        allocatedSkillPoints={allocatedSkillPoints}
        onAllocateSkillPoint={allocateSkillPoint}
        onDeallocateSkillPoint={deallocateSkillPoint}
        onClose={() => setShowSkillModal(false)}
      />

      <SpellSelectionModal
        isOpen={showSpellModal}
        availableSpells={availableSpells}
        selectedSpellIds={selectedSpells}
        spellsToSelect={spellsToSelect}
        onSelectSpell={selectSpell}
        onDeselectSpell={deselectSpell}
        onClose={() => setShowSpellModal(false)}
      />
    </div>
  );
}
```

### Step 4: Run test to verify it passes

```bash
npm test -- src/__tests__/screens/LevelUpScreen.test.tsx
```

Expected: PASS (4 tests)

### Step 5: Commit

```bash
git add src/screens/LevelUpScreen.tsx src/__tests__/screens/LevelUpScreen.test.tsx
git commit -m "feat(ui): integrate modals into LevelUpScreen"
```

---

## Task 7: LevelUpScreen - Complete Button

**Files:**
- Modify: `src/screens/LevelUpScreen.tsx`
- Modify: `src/__tests__/screens/LevelUpScreen.test.tsx`

### Step 1: Write the failing test

Add to `src/__tests__/screens/LevelUpScreen.test.tsx`:

```typescript
it('should show complete button when all choices made', () => {
  vi.mocked(useLevelUpStore).mockReturnValue({
    ...vi.mocked(useLevelUpStore)(),
    pendingLevelUp: {
      oldLevel: 1,
      newLevel: 2,
      hpGained: 8,
      babGained: 1,
      savesGained: { fort: 1, reflex: 0, will: 0 },
      featGained: true,
      skillPoints: 2,
      classFeatures: [],
    },
    selectedFeat: 'power_attack',
    skillPointsToAllocate: 2,
    allocatedSkillPoints: { Athletics: 1, Intimidate: 1 },
  });

  render(
    <BrowserRouter>
      <LevelUpScreen />
    </BrowserRouter>
  );

  expect(screen.getByText(/Complete Level-Up/i)).toBeInTheDocument();
});

it('should call completeLevelUp and navigate when complete clicked', () => {
  const mockCompleteLevelUp = vi.fn();
  vi.mocked(useLevelUpStore).mockReturnValue({
    ...vi.mocked(useLevelUpStore)(),
    completeLevelUp: mockCompleteLevelUp,
    selectedFeat: 'power_attack',
    allocatedSkillPoints: { Athletics: 2 },
  });

  render(
    <BrowserRouter>
      <LevelUpScreen />
    </BrowserRouter>
  );

  const completeButton = screen.getByText(/Complete Level-Up/i);
  fireEvent.click(completeButton);

  expect(mockCompleteLevelUp).toHaveBeenCalled();
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- src/__tests__/screens/LevelUpScreen.test.tsx
```

Expected: FAIL - "Unable to find element with text /Complete Level-Up/i"

### Step 3: Add complete button

In `src/screens/LevelUpScreen.tsx`, add after the choices section:

```typescript
// Add this function before return
const canComplete = () => {
  // Check feat selection if required
  if (pendingLevelUp.featGained && !selectedFeat) {
    return false;
  }

  // Check skill allocation if required
  const totalAllocated = Object.values(allocatedSkillPoints).reduce(
    (sum, points) => sum + (points || 0),
    0
  );
  if (pendingLevelUp.skillPoints > 0 && totalAllocated < skillPointsToAllocate) {
    return false;
  }

  // Check spell selection if required
  if (spellsToSelect > 0 && selectedSpells.length < spellsToSelect) {
    return false;
  }

  return true;
};

const handleComplete = () => {
  completeLevelUp();
  navigate('/');
};

// Add this import at top
import { completeLevelUp as completeLevelUpUtil } from '../utils/levelUpTrigger';

// In JSX, add after the choices section, before modals:
        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={!canComplete()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-xl"
        >
          {canComplete() ? 'Complete Level-Up' : 'Make All Choices to Continue'}
        </button>
```

### Step 4: Run test to verify it passes

```bash
npm test -- src/__tests__/screens/LevelUpScreen.test.tsx
```

Expected: PASS (6 tests)

### Step 5: Commit

```bash
git add src/screens/LevelUpScreen.tsx src/__tests__/screens/LevelUpScreen.test.tsx
git commit -m "feat(ui): add complete button to LevelUpScreen"
```

---

## Task 8: Add Route Configuration

**Files:**
- Modify: `src/App.tsx` (or wherever routes are defined)

### Step 1: Add route for LevelUpScreen

Find the router configuration and add:

```typescript
import { LevelUpScreen } from './screens/LevelUpScreen';

// In your Routes:
<Route path="/level-up" element={<LevelUpScreen />} />
```

### Step 2: Test navigation manually

```bash
npm run dev
```

Navigate to `http://localhost:5173/level-up` and verify redirect occurs (since no level-up is in progress).

### Step 3: Commit

```bash
git add src/App.tsx
git commit -m "feat(ui): add level-up route to app routing"
```

---

## Task 9: Integration Testing

**Files:**
- Create: `src/__tests__/integration/levelUpFlow.test.tsx`

### Step 1: Write integration test

Create `src/__tests__/integration/levelUpFlow.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LevelUpScreen } from '../../screens/LevelUpScreen';
import { useCharacterStore } from '../../stores/characterStore';
import { useLevelUpStore } from '../../stores/levelUpStore';
import { triggerLevelUp } from '../../utils/levelUpTrigger';
import type { Character } from '../../types/character';

describe('Level-Up Flow Integration', () => {
  const mockFighter: Character = {
    name: 'Test Fighter',
    avatarPath: 'avatar.png',
    class: 'Fighter',
    level: 1,
    maxHp: 14,
    hp: 14,
    ac: 15,
    bab: 1,
    saves: { fortitude: 2, reflex: 0, will: 0 },
    attributes: { STR: 14, DEX: 10, CON: 14, INT: 10, WIS: 10, CHA: 10 },
    skills: { Athletics: 0, Stealth: 0, Perception: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
    feats: [],
    equipment: { weapon: null, weapons: [], armor: null, shield: null, items: [] },
    resources: { abilities: [] },
  };

  beforeEach(() => {
    useCharacterStore.setState({ character: mockFighter });
    useLevelUpStore.getState().cancelLevelUp();
  });

  it('should complete full level-up flow with feat and skills', async () => {
    // Trigger level-up to level 2
    triggerLevelUp(2);

    render(
      <BrowserRouter>
        <LevelUpScreen />
      </BrowserRouter>
    );

    // Verify level-up summary
    expect(screen.getByText(/Level 2!/i)).toBeInTheDocument();
    expect(screen.getByText(/\+8 HP/i)).toBeInTheDocument();

    // Load and select a feat
    useLevelUpStore.getState().loadAvailableFeats();
    const selectFeatButton = screen.getByText(/Select Feat/i);
    fireEvent.click(selectFeatButton);

    await waitFor(() => {
      const availableFeats = useLevelUpStore.getState().availableFeats;
      if (availableFeats.length > 0) {
        const firstFeat = screen.getByText(availableFeats[0].name);
        fireEvent.click(firstFeat);
      }
    });

    // Allocate skill points
    const allocateSkillsButton = screen.getByText(/Allocate Skills/i);
    fireEvent.click(allocateSkillsButton);

    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]); // Add 1 to first skill
    fireEvent.click(plusButtons[1]); // Add 1 to second skill

    const modal = screen.getByText(/Allocate Skill Points/i).closest('div');
    const closeButton = modal?.querySelector('[aria-label="Close"]');
    if (closeButton) fireEvent.click(closeButton);

    // Complete level-up
    await waitFor(() => {
      const completeButton = screen.getByText(/Complete Level-Up/i);
      expect(completeButton).not.toBeDisabled();
      fireEvent.click(completeButton);
    });

    // Verify character was updated
    const updatedCharacter = useCharacterStore.getState().character;
    expect(updatedCharacter?.level).toBe(2);
    expect(updatedCharacter?.maxHp).toBe(22); // 14 + 8
  });
});
```

### Step 2: Run integration test

```bash
npm test -- src/__tests__/integration/levelUpFlow.test.tsx
```

Expected: PASS (1 test)

### Step 3: Commit

```bash
git add src/__tests__/integration/levelUpFlow.test.tsx
git commit -m "test(ui): add level-up flow integration test"
```

---

## Task 10: Documentation

**Files:**
- Create: `docs/ui/level-up-screens.md`

### Step 1: Create UI documentation

Create `docs/ui/level-up-screens.md`:

```markdown
# Level-Up Screens UI Documentation

## Overview

The level-up UI consists of a main screen (LevelUpScreen) and three modals for player choices (feats, skills, spells).

## Components

### LevelUpScreen (`src/screens/LevelUpScreen.tsx`)

**Purpose:** Main screen showing level-up summary and orchestrating player choices.

**Features:**
- Displays stat increases (HP, BAB, saves)
- Shows class features gained
- Opens modals for feat/skill/spell selection
- Validates all choices before allowing completion

**State Management:**
- Reads from `useLevelUpStore`
- Reads from `useCharacterStore` (for current skills)

**Navigation:**
- Redirects to `/` if no level-up in progress
- Returns to `/` on completion

### FeatSelectionModal (`src/components/levelUp/FeatSelectionModal.tsx`)

**Purpose:** Modal for selecting a feat from available options.

**Props:**
- `isOpen: boolean` - Show/hide modal
- `availableFeats: Feat[]` - Feats to choose from
- `selectedFeatId: string | null` - Currently selected feat
- `onSelectFeat: (id) => void` - Callback when feat selected
- `onClose: () => void` - Callback to close modal

**Features:**
- Displays feat name, description, category, type
- Highlights selected feat
- Single selection only

### SkillAllocationModal (`src/components/levelUp/SkillAllocationModal.tsx`)

**Purpose:** Modal for allocating skill points.

**Props:**
- `isOpen: boolean`
- `skillPointsToAllocate: number` - Total points to allocate
- `currentSkills: SkillRanks` - Character's current skill values
- `allocatedSkillPoints: Partial<SkillRanks>` - Points allocated this level
- `onAllocateSkillPoint: (skill) => void`
- `onDeallocateSkillPoint: (skill) => void`
- `onClose: () => void`

**Features:**
- Shows current value → new value for each skill
- +/− buttons to adjust allocation
- Real-time points remaining counter
- Prevents over-allocation

### SpellSelectionModal (`src/components/levelUp/SpellSelectionModal.tsx`)

**Purpose:** Modal for learning new spells (casters only).

**Props:**
- `isOpen: boolean`
- `availableSpells: Spell[]` - Spells available to learn
- `selectedSpellIds: string[]` - Currently selected spells
- `spellsToSelect: number` - How many spells to select
- `onSelectSpell: (id) => void`
- `onDeselectSpell: (id) => void`
- `onClose: () => void`

**Features:**
- Displays spell name, description, level, school, target
- Multi-selection support
- Toggle selection on click
- Visual checkmark for selected spells

## Usage

### Triggering Level-Up

```typescript
import { triggerLevelUp } from '../utils/levelUpTrigger';
import { useNavigate } from 'react-router-dom';

function MyCampaignNode() {
  const navigate = useNavigate();

  const handleLevelUp = () => {
    triggerLevelUp(2); // Advance to level 2
    navigate('/level-up');
  };

  return <button onClick={handleLevelUp}>Level Up!</button>;
}
```

### Auto-Completing for Testing

```typescript
import { autoLevelUp } from '../utils/levelUpTrigger';

// In test setup or dev tools
autoLevelUp(5); // Jump to level 5 with default choices
```

## Styling

All components use Tailwind CSS with a dark theme:
- Background: `bg-gray-900` to `bg-gray-800` gradient
- Cards: `bg-gray-800/50` or `bg-gray-700`
- Primary actions: `bg-green-600`
- Secondary actions: `bg-blue-600`, `bg-purple-600`, `bg-indigo-600`
- Selected state: `ring-2 ring-green-500`

## Mobile Considerations

- Touch-friendly button sizes (min 44px height)
- Scrollable modals with max-height
- Fixed headers in modals for context while scrolling
- Large, clear text for readability

## Testing

Run all level-up UI tests:

```bash
npm test -- src/__tests__/screens/LevelUpScreen.test.tsx
npm test -- src/__tests__/components/levelUp/
npm test -- src/__tests__/integration/levelUpFlow.test.tsx
```

## Future Enhancements

- Animations for stat increases
- Sound effects for level-up
- Character sheet preview
- Undo/redo for choices
- Saved templates for quick leveling
```

### Step 2: Commit

```bash
git add docs/ui/level-up-screens.md
git commit -m "docs(ui): add level-up screens documentation"
```

---

## Task 11: Final Verification

### Step 1: Run all tests

```bash
npm test
```

Expected: ALL TESTS PASS

### Step 2: Run build

```bash
npm run build
```

Expected: BUILD SUCCESS

### Step 3: Run lint

```bash
npm run lint
```

Expected: NO ERRORS

### Step 4: Manual testing checklist

Start dev server:
```bash
npm run dev
```

Test flow:
1. [ ] Navigate to `/level-up` - should redirect (no level-up in progress)
2. [ ] Trigger level-up via console or campaign
3. [ ] Verify stat increases display
4. [ ] Open feat modal, select feat, close modal
5. [ ] Open skill modal, allocate points, close modal
6. [ ] Open spell modal (if caster), select spells, close modal
7. [ ] Click "Complete Level-Up"
8. [ ] Verify redirect to home
9. [ ] Verify character stats updated

### Step 5: Final commit

```bash
git add .
git commit -m "feat(ui): complete Phase 4 UI implementation - level-up screens"
```

---

## Summary

**Files Created:**
- `src/screens/LevelUpScreen.tsx` - Main level-up screen
- `src/components/levelUp/FeatSelectionModal.tsx` - Feat selection
- `src/components/levelUp/SkillAllocationModal.tsx` - Skill allocation
- `src/components/levelUp/SpellSelectionModal.tsx` - Spell learning
- `src/__tests__/screens/LevelUpScreen.test.tsx` - Screen tests
- `src/__tests__/components/levelUp/FeatSelectionModal.test.tsx` - Modal tests
- `src/__tests__/components/levelUp/SkillAllocationModal.test.tsx` - Modal tests
- `src/__tests__/components/levelUp/SpellSelectionModal.test.tsx` - Modal tests
- `src/__tests__/integration/levelUpFlow.test.tsx` - Integration tests
- `docs/ui/level-up-screens.md` - UI documentation

**Test Count:** ~20+ new tests

**Integration Points:**
- `useLevelUpStore` - All state management
- `useCharacterStore` - Current character data
- `levelUpTrigger` utilities - Trigger and complete level-ups
- React Router - Navigation flow

---

## Plan Complete

Plan saved to `docs/plans/2026-01-01-phase-4-ui-level-up-screens.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach would you like to use?**
