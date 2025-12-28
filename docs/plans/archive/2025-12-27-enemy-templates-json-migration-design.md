# Enemy Templates JSON Migration Design

**Date**: 2025-12-27
**Status**: Design Complete
**Goal**: Migrate enemy templates from TypeScript objects to JSON with Zod validation

## Overview

Transform enemy templates from hard-coded TypeScript objects to validated JSON while maintaining complete type safety and the existing API. This migration enables better content management, clearer error messages, and sets the foundation for future content tooling.

## Key Decisions

1. **Build-time validation** - JSON validated during build, zero runtime cost, errors caught early
2. **Avatar keys in JSON** - Store keys (e.g., `"Bandit"`), resolve to paths via `CREATURE_AVATARS` in loader
3. **Location**: `src/data/enemies.json` - Alongside existing data files, imported as module
4. **Parallel validation** - Keep legacy TS temporarily, validate both produce identical output
5. **Hand-written schema** - Explicit validation rules, clear error messages, full control

## Architecture

### File Structure

```
src/
├── data/
│   ├── enemies.json (NEW)              # Enemy data - single source of truth
│   ├── enemyTemplates.ts (MODIFIED)     # Loader with validation & avatar resolution
│   ├── enemyTemplates.legacy.ts (TEMP)  # Current TS version for parallel validation
│   └── creatureAvatars.ts              # Avatar path mapping (unchanged)
├── schemas/
│   └── enemyTemplate.schema.ts (NEW)   # Zod validation schema
└── __tests__/
    └── data/
        ├── enemyTemplates.test.ts      # Existing tests (unchanged)
        └── enemyTemplates.migration.test.ts (TEMP) # Parallel validation test
```

### Build-time Validation Flow

1. Vite imports `enemies.json` as a module during build
2. Loader imports JSON and runs Zod validation (`EnemyTemplatesSchema.parse()`)
3. Validation failure → Build fails with detailed error message
4. Validation success → Avatar keys resolved to full paths
5. Typed `Record<string, EnemyTemplate>` exported
6. Existing API (`getEnemyTemplate(id)`) unchanged - no consumer changes needed

## Schema Structure

### Validation Rules

The hand-written Zod schema mirrors the `EnemyTemplate` TypeScript type but adds runtime validation that TypeScript can't enforce:

**Attribute Ranges**:
- Values: 1-30 integer range
- min ≤ max validation

**Damage Dice**:
- Must match pattern: `/^\d+d\d+$/` (e.g., "1d6", "2d8")

**Level Range**:
- Positive integers
- min ≤ max validation

**Avatar Paths**:
- Array must have at least one entry
- Values are keys, not full paths

**Required Strings**:
- Non-empty validation for names, descriptions, etc.

### Schema Organization

```typescript
// src/schemas/enemyTemplate.schema.ts
import { z } from 'zod';

const AttributeRangeSchema = z.object({
  min: z.number().int().min(1).max(30),
  max: z.number().int().min(1).max(30),
}).refine(data => data.min <= data.max, {
  message: "min must be <= max"
});

const WeaponSchema = z.object({
  name: z.string().min(1),
  damage: z.string().regex(/^\d+d\d+$/),
  damageType: z.string(),
  finesse: z.boolean(),
  description: z.string(),
});

const EnemyTemplateSchema = z.object({
  id: z.string().min(1),
  baseName: z.string().min(1),
  creatureClass: z.string(),
  avatarPaths: z.array(z.string()).min(1),
  levelRange: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }).refine(data => data.min <= data.max),
  attributeRanges: z.object({
    STR: AttributeRangeSchema,
    DEX: AttributeRangeSchema,
    CON: AttributeRangeSchema,
    INT: AttributeRangeSchema,
    WIS: AttributeRangeSchema,
    CHA: AttributeRangeSchema,
  }),
  // ... equipment, skills, feats, taunts, lootTableId
});

export const EnemyTemplatesSchema = z.record(z.string(), EnemyTemplateSchema);
```

## Data Flow

### JSON Format

```json
{
  "bandit": {
    "id": "bandit",
    "baseName": "Bandit",
    "creatureClass": "Humanoid",
    "avatarPaths": ["Bandit"],  // Keys, not full paths
    "levelRange": { "min": 1, "max": 2 },
    "attributeRanges": {
      "STR": { "min": 12, "max": 14 },
      // ... etc
    },
    "equipment": { /* ... */ },
    "skills": { /* ... */ },
    "feats": [],
    "taunts": { /* ... */ },
    "lootTableId": "bandit_loot"
  }
  // ... skeleton, wraith, giantSpider
}
```

### Loader Implementation

```typescript
// src/data/enemyTemplates.ts
import { EnemyTemplatesSchema } from '../schemas/enemyTemplate.schema';
import { CREATURE_AVATARS, DEFAULT_CREATURE_AVATAR } from './creatureAvatars';
import type { EnemyTemplate } from '../types/enemyTemplate';
import enemiesJson from './enemies.json';

// Validate JSON at module load (build-time)
const validatedData = EnemyTemplatesSchema.parse(enemiesJson);

// Transform: resolve avatar keys to paths
export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = Object.fromEntries(
  Object.entries(validatedData).map(([id, template]) => [
    id,
    {
      ...template,
      avatarPaths: template.avatarPaths.map(
        key => CREATURE_AVATARS[key] || DEFAULT_CREATURE_AVATAR
      ),
    },
  ])
);

// Existing API unchanged
export function getEnemyTemplate(id: string): EnemyTemplate | null {
  return ENEMY_TEMPLATES[id] ?? null;
}
```

### Error Handling

**Validation Failure**: Zod throws with detailed message showing exactly what's wrong:
- Example: `"bandit.levelRange.min: Expected number, received string"`
- Build fails immediately
- Bad data never reaches production

**Runtime Errors**:
- Missing avatar key → Falls back to `DEFAULT_CREATURE_AVATAR`
- Invalid enemy ID → `getEnemyTemplate()` returns `null` (existing behavior)

## Testing Strategy

### Parallel Validation Test

Ensures JSON produces identical output to current TypeScript implementation:

```typescript
// src/__tests__/data/enemyTemplates.migration.test.ts
import { describe, it, expect } from 'vitest';
import { ENEMY_TEMPLATES as NewTemplates } from '../data/enemyTemplates';
import { ENEMY_TEMPLATES as LegacyTemplates } from '../data/enemyTemplates.legacy';

describe('Enemy Templates Migration', () => {
  it('JSON templates match legacy TypeScript templates exactly', () => {
    const newIds = Object.keys(NewTemplates).sort();
    const legacyIds = Object.keys(LegacyTemplates).sort();

    // Same enemy IDs
    expect(newIds).toEqual(legacyIds);

    // Each template matches exactly
    for (const id of newIds) {
      expect(NewTemplates[id]).toEqual(LegacyTemplates[id]);
    }
  });

  it('generates identical creatures from both systems', () => {
    // Test with fixed seed for deterministic comparison
    // Generate enemies using both templates, verify identical output
  });
});
```

### Existing Tests

`src/__tests__/data/enemyTemplates.test.ts` continues to work unchanged since the exported API is identical.

## Migration Steps

1. **Preserve legacy**: Rename `enemyTemplates.ts` → `enemyTemplates.legacy.ts`
2. **Create JSON**: Convert current TypeScript data to `enemies.json`
3. **Create schema**: Write `enemyTemplate.schema.ts` with validation rules
4. **Create loader**: Write new `enemyTemplates.ts` with validation and avatar resolution
5. **Add test**: Create `enemyTemplates.migration.test.ts` for parallel validation
6. **Verify**: Run all tests - must pass 100%
7. **Clean up**: Delete `enemyTemplates.legacy.ts` and migration test
8. **Commit**: Commit the completed migration

## Future Benefits

### Immediate
- **Better error messages**: Runtime validation catches data errors with clear messages
- **Safer editing**: Non-developers can edit JSON with validation feedback
- **Cleaner diffs**: JSON changes are clearer in git than TypeScript object changes
- **Content tooling foundation**: Could build web form to edit enemies, validate on save

### Maintenance
- **Adding enemies**: Just add to `enemies.json`, Zod validates automatically
- **Changing schema**: Update both Zod schema AND TypeScript type (must match)
- **Avatar management**: Still centralized in `CREATURE_AVATARS`, just referenced by key

### Schema Evolution

When adding new fields (e.g., boss mechanics, special abilities):
1. Update TypeScript type in `types/enemyTemplate.ts`
2. Update Zod schema in `schemas/enemyTemplate.schema.ts`
3. Add `.optional()` for backward compatibility if needed
4. TypeScript compiler catches any mismatches

## Edge Cases

| Case | Handling |
|------|----------|
| Missing avatar key | Falls back to `DEFAULT_CREATURE_AVATAR` |
| Invalid enemy ID | `getEnemyTemplate()` returns `null` (existing behavior) |
| Malformed JSON | Build fails with clear error message |
| Schema/type mismatch | TypeScript compiler catches it |
| Empty avatarPaths array | Zod validation fails: "Array must contain at least 1 element" |
| Level min > max | Zod validation fails: "min must be <= max" |

## Success Criteria

- [ ] All existing tests pass without modification
- [ ] Parallel validation test confirms identical output
- [ ] `npm run build` succeeds with no validation errors
- [ ] `getEnemyTemplate(id)` API unchanged
- [ ] Avatar paths resolve correctly to full paths
- [ ] Invalid JSON causes build failure with clear error message

## Post-Migration State

After migration, the codebase has:
- **Single source of truth**: `enemies.json` contains all enemy data
- **Build-time validation**: Zod ensures data integrity before production
- **Full type safety**: TypeScript types maintained throughout
- **Unchanged API**: Consumer code requires zero changes
- **Better DX**: Clear error messages, easier content editing, cleaner git history
