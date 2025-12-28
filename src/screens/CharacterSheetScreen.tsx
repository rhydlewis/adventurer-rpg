import { useState } from 'react';
import type { Character } from '../types';
import { calculateModifier } from '../utils/dice';
import { calculateSkillBonus } from '../utils/skills';
import type { SkillName } from '../types';
import { BackButton, Button, Card, Icon } from '../components';
import { canUseItem, getItemDisabledReason, hasWeaponProficiency } from '../utils/equipmentHelpers';
import { applyItemEffect } from '../utils/itemEffects';
import { useCombatStore } from '../stores/combatStore';
import { useCharacterStore } from '../stores/characterStore';

interface CharacterSheetScreenProps {
  character: Character | null;
  onClose: () => void;
}

// Attribute icon mapping (Lucide React icons)
const attributeIcons = {
  STR: 'Sword' as const,
  DEX: 'Zap' as const,
  CON: 'Heart' as const,
  INT: 'Brain' as const,
  WIS: 'Eye' as const,
  CHA: 'Sparkles' as const,
};

const attributeLabels = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

// Skill icon mapping (Lucide React icons)
const skillIcons = {
  Athletics: 'Dumbbell' as const,
  Stealth: 'EyeOff' as const,
  Perception: 'Eye' as const,
  Arcana: 'Sparkles' as const,
  Medicine: 'Heart' as const,
  Intimidate: 'Flame' as const,
};

type AttributeKey = keyof typeof attributeIcons;
type TabType = 'overview' | 'skills' | 'combat';

const formatModifier = (value: number): string => {
  return value >= 0 ? `+${value}` : `${value}`;
};

export function CharacterSheetScreen({ character, onClose }: CharacterSheetScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const skillNames: SkillName[] = ['Athletics', 'Stealth', 'Perception', 'Arcana', 'Medicine', 'Intimidate'];

  // Detect character state: none, phase1 (identity-only), phase2 (full)
  const characterState = !character
    ? 'none'
    : character.mechanicsLocked === false
      ? 'phase1'
      : 'phase2';

  // Handle "No Character" state
  if (characterState === 'none') {
    return (
      <div className="min-h-screen bg-primary text-fg-primary p-4 flex items-center justify-center">
        <Card variant="neutral" padding="spacious">
          <div className="text-center space-y-4">
            <Icon name="User" size={64} className="mx-auto text-fg-muted" />
            <h1 className="heading-primary text-fg-accent">No Character Created</h1>
            <p className="body-primary text-fg-secondary">
              You haven't created a character yet. Start a story or create a character to view your character sheet.
            </p>
            <Button onClick={onClose} variant="primary" fullWidth>
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-fg-primary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton onBack={onClose} />
        </div>

        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          {/* Character Avatar */}
          <img
            src={`/assets/avatars/${character!.avatarPath}`}
            alt={character!.name}
            className="w-20 h-20 rounded-lg ring-4 ring-accent object-cover"
          />
          <div>
            <h1 className="heading-primary text-fg-accent">{character!.name}</h1>
            <p className="body-secondary text-fg-secondary">
              Level {character!.level} {character!.class}
            </p>
            {characterState === 'phase1' && (
              <p className="text-xs text-warning mt-1">
                ⚠️ Identity-First Character - Complete training to unlock full customization
              </p>
            )}
          </div>
        </div>

        {/* Tab Navigation - Only show all tabs for phase2 characters */}
        {characterState === 'phase2' && (
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon="User"
            >
              Overview
            </TabButton>
            <TabButton
              active={activeTab === 'skills'}
              onClick={() => setActiveTab('skills')}
              icon="Target"
            >
              Skills
            </TabButton>
            <TabButton
              active={activeTab === 'combat'}
              onClick={() => setActiveTab('combat')}
              icon="Swords"
            >
              Combat
            </TabButton>
          </div>
        )}

        {/* Tab Content */}
        {characterState === 'phase1' && <Phase1OverviewTab character={character!} />}
        {characterState === 'phase2' && (
          <>
            {activeTab === 'overview' && <OverviewTab character={character!} />}
            {activeTab === 'skills' && <SkillsTab character={character!} skillNames={skillNames} />}
            {activeTab === 'combat' && <CombatTab character={character!} />}
          </>
        )}
      </div>
    </div>
  );
}

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: keyof typeof import('lucide-react').icons;
  children: React.ReactNode;
}

function TabButton({ active, onClick, icon, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg tab-text transition-all min-h-[44px] ${
        active
          ? 'bg-player text-white shadow-lg'
          : 'bg-surface text-fg-secondary hover:bg-surface/80 hover:text-fg-primary'
      }`}
    >
      <Icon name={icon} size={20} />
      <span>{children}</span>
    </button>
  );
}

// Phase 1 Overview Tab - Simplified identity-only view
function Phase1OverviewTab({ character }: { character: Character }) {
  return (
    <div className="space-y-6">
      {/* Identity-First Message */}
      <Card variant="neutral" padding="spacious">
        <div className="text-center space-y-2">
          <Icon name="Sparkles" size={32} className="mx-auto text-warning" />
          <h2 className="text-h2 heading-secondary text-fg-accent">Identity-First Character</h2>
          <p className="body-primary text-fg-secondary">
            Your character's identity has been established. Continue your training to unlock full mechanical customization and see detailed statistics.
          </p>
        </div>
      </Card>

      {/* HP */}
      <Card variant="neutral" className="text-center">
        <div className="label-secondary text-xs text-fg-muted mb-2">Hit Points</div>
        <div className="stat-large text-3xl text-fg-accent">
          {character.hp}/{character.maxHp}
        </div>
      </Card>

      {/* Basic Attributes */}
      <Card variant="neutral">
        <h2 className="text-h2 heading-secondary mb-4">Basic Attributes</h2>
        <p className="body-secondary text-fg-muted text-sm mb-4">
          Your base capabilities. Complete training to see modifiers and unlock customization.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.keys(attributeIcons) as AttributeKey[]).map((attr) => {
            const iconName = attributeIcons[attr];
            const score = character.attributes[attr];

            return (
              <div
                key={attr}
                className="bg-surface rounded-lg p-3 flex items-center space-x-3 border border-border-default"
              >
                <div className="bg-primary p-2 rounded-lg">
                  <Icon name={iconName} size={24} className="text-player" />
                </div>
                <div className="flex-1">
                  <div className="attribute-label text-xs text-fg-muted">
                    {attributeLabels[attr]}
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="stat-medium text-2xl text-fg-accent">
                      {score}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// Overview Tab - Full view for phase2 characters
function OverviewTab({ character }: { character: Character }) {
  return (
    <div className="space-y-6">
      {/* HP, AC, BAB Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="neutral" className="text-center">
          <div className="label-secondary text-xs text-fg-muted mb-2">Hit Points</div>
          <div className="stat-large text-3xl text-fg-accent">
            {character.hp}/{character.maxHp}
          </div>
        </Card>
        <Card variant="neutral" className="text-center">
          <div className="label-secondary text-xs text-fg-muted mb-2">Armor Class</div>
          <div className="stat-large text-3xl text-fg-accent">
            {character.ac}
          </div>
        </Card>
        <Card variant="neutral" className="text-center">
          <div className="label-secondary text-xs text-fg-muted mb-2">Attack Bonus</div>
          <div className="stat-large text-3xl text-fg-accent">
            {formatModifier(character.bab)}
          </div>
        </Card>
      </div>

      {/* Attributes */}
      <Card variant="neutral">
        <h2 className="text-h2 heading-secondary mb-4">Attributes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.keys(attributeIcons) as AttributeKey[]).map((attr) => {
            const iconName = attributeIcons[attr];
            const score = character.attributes[attr];
            const modifier = calculateModifier(score);

            return (
              <div
                key={attr}
                className="bg-surface rounded-lg p-3 flex items-center space-x-3 border border-border-default"
              >
                <div className="bg-primary p-2 rounded-lg">
                  <Icon name={iconName} size={24} className="text-player" />
                </div>
                <div className="flex-1">
                  <div className="attribute-label text-xs text-fg-muted">
                    {attributeLabels[attr]}
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="stat-medium text-2xl text-fg-accent">
                      {score}
                    </span>
                    <span className="body-secondary text-sm text-fg-secondary">
                      ({formatModifier(modifier)})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Saving Throws */}
      <Card variant="neutral">
        <h2 className="text-h2 heading-secondary mb-4">Saving Throws</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface rounded-lg p-4 text-center border border-border-default">
            <div className="label-secondary text-xs text-fg-muted mb-2">
              Fortitude
            </div>
            <div className="stat-medium text-2xl text-success">
              {formatModifier(character.saves.fortitude)}
            </div>
          </div>
          <div className="bg-surface rounded-lg p-4 text-center border border-border-default">
            <div className="label-secondary text-xs text-fg-muted mb-2">
              Reflex
            </div>
            <div className="stat-medium text-2xl text-warning">
              {formatModifier(character.saves.reflex)}
            </div>
          </div>
          <div className="bg-surface rounded-lg p-4 text-center border border-border-default">
            <div className="label-secondary text-xs text-fg-muted mb-2">
              Will
            </div>
            <div className="stat-medium text-2xl text-magic">
              {formatModifier(character.saves.will)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Skills Tab
function SkillsTab({ character, skillNames }: { character: Character; skillNames: SkillName[] }) {
  return (
    <Card variant="neutral">
      <h2 className="text-h2 heading-secondary mb-4">Skills</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {skillNames.map((skillName) => {
          const skillBonus = calculateSkillBonus(character, skillName);
          const hasRanks = character.skills[skillName] > 0;
          const iconName = skillIcons[skillName as keyof typeof skillIcons];

          return (
            <div
              key={skillName}
              className="bg-surface rounded-lg p-3 flex items-center space-x-3 border border-border-default"
            >
              <div className="bg-primary p-2 rounded-lg">
                <Icon
                  name={iconName}
                  size={24}
                  className="text-player"
                />
              </div>
              <div className="flex-1">
                <div className="attribute-label text-xs text-fg-muted">
                  {skillName}
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="stat-medium text-2xl text-fg-accent">
                    {formatModifier(skillBonus.totalBonus)}
                  </span>
                  {hasRanks && (
                    <span className="body-secondary text-sm text-fg-secondary">
                      ({character.skills[skillName]} ranks)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Combat Tab
function CombatTab({ character }: { character: Character }) {
  const combat = useCombatStore(state => state.combat);
  const setCharacter = useCharacterStore(state => state.setCharacter);

  // Handle item usage
  const handleUseItem = (itemId: string) => {
    if (!character) return;

    const item = character.equipment.items.find(i => i.id === itemId);
    if (!item || !item.effect) return;

    // Apply effect
    const inCombat = combat !== null;
    const { character: updated, logMessage } = applyItemEffect(character, item.effect, inCombat);

    // Decrement quantity
    const updatedItems = updated.equipment.items
      .map(i =>
        i.id === itemId
          ? { ...i, quantity: (i.quantity ?? 1) - 1 }
          : i
      )
      .filter(i => (i.quantity ?? 0) > 0);

    const updatedCharacter = { ...updated, equipment: { ...updated.equipment, items: updatedItems } };

    // Update character store
    setCharacter(updatedCharacter);

    // Show feedback (optional: add toast notification)
    console.log(`Used ${item.name}: ${logMessage}`);
  };

  // Handle weapon equipping
  const handleEquipWeapon = (weaponId: string) => {
    if (!character) return;

    const weapon = character.equipment.weapons?.find(
      w => w.id === weaponId || w.name === weaponId
    );
    if (!weapon) return;

    // Check proficiency
    if (!hasWeaponProficiency(character, weapon)) {
      console.warn('Cannot equip: not proficient');
      return;
    }

    // Equip weapon
    const updated = {
      ...character,
      equipment: {
        ...character.equipment,
        weapon,
      },
    };

    // Update character store
    setCharacter(updated);

    // If in combat, also update combat store
    if (combat && combat.playerCharacter) {
      useCombatStore.getState().swapWeapon(weapon.id || weapon.name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feats */}
      {character.feats.length > 0 && (
        <Card variant="neutral">
          <h2 className="text-h2 heading-secondary mb-4">Feats</h2>
          <div className="space-y-3">
            {character.feats.map((feat, idx) => (
              <div key={idx} className="bg-surface rounded-lg p-4">
                <h3 className="font-bold text-lg mb-1 feat-name text-fg-accent">
                  {feat.name}
                </h3>
                <p className="text-sm text-fg-secondary body-secondary">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Abilities & Resources */}
      {(character.resources.abilities.length > 0 || character.resources.spellSlots) && (
        <Card variant="neutral">
          <h2 className="text-h2 heading-secondary mb-4">Abilities & Resources</h2>

          {/* Abilities */}
          {character.resources.abilities.length > 0 && (
            <div className="space-y-3 mb-4">
              {character.resources.abilities.map((ability, idx) => (
                <div key={idx} className="bg-surface rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg feat-name text-fg-accent">
                      {ability.name}
                    </h3>
                    <span className="text-sm bg-primary px-2 py-1 rounded body-secondary text-fg-secondary">
                      {ability.currentUses}/{ability.maxUses} {ability.type}
                    </span>
                  </div>
                  <p className="text-sm text-fg-secondary body-secondary">
                    {ability.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Spell Slots */}
          {character.resources.spellSlots && (
            <div className="bg-surface rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2 heading-tertiary">Spell Slots</h3>
              <div className="space-y-2 body-secondary">
                <div className="flex justify-between">
                  <span>Cantrips (Level 0)</span>
                  <span className="text-fg-muted">At-will</span>
                </div>
                <div className="flex justify-between">
                  <span>Level 1</span>
                  <span className="font-semibold">
                    {character.resources.spellSlots.level1.current}/
                    {character.resources.spellSlots.level1.max}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Equipment */}
      <Card variant="neutral">
        <h2 className="text-h2 heading-secondary mb-4">
          Equipment
        </h2>

        {/* Equipped Items */}
        <div className="space-y-3 mb-4">
          <EquipmentItem
            icon="Sword"
            label="Weapon"
            value={character.equipment.weapon?.name || 'Unarmed Strike'}
          />
          <EquipmentItem
            icon="Shield"
            label="Armor"
            value={character.equipment.armor?.name || 'None'}
          />
          {character.equipment.shield?.equipped && (
            <EquipmentItem
              icon="ShieldAlert"
              label="Shield"
              value={`+${character.equipment.shield.acBonus} AC`}
            />
          )}
        </div>

        {/* Weapons Section */}
        {(character.equipment.weapons?.length ?? 0) > 0 && (
          <div className="mt-4">
            <h3 className="font-bold text-lg mb-3 heading-tertiary flex items-center">
              <Icon name="Swords" size={20} className="mr-2 text-fg-accent" />
              Weapons
            </h3>
            <div className="space-y-2">
              {character.equipment.weapons?.map((weapon, idx) => {
                const isEquipped = character.equipment.weapon?.id === weapon.id ||
                                  character.equipment.weapon?.name === weapon.name;
                const canEquip = hasWeaponProficiency(character, weapon);

                return (
                  <div key={idx} className="flex justify-between items-center bg-surface rounded p-3 body-primary">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{weapon.name}</span>
                        <span className="text-fg-muted text-xs">
                          {weapon.damage} {weapon.damageType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {isEquipped && (
                          <span className="text-emerald-400 text-xs flex items-center">
                            <Icon name="Check" size={12} className="mr-1" />
                            Equipped
                          </span>
                        )}
                        {!canEquip && (
                          <span className="text-red-400 text-xs">
                            ⚠️ Requires {weapon.proficiencyRequired} proficiency
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleEquipWeapon(weapon.id || weapon.name)}
                      variant={!isEquipped && canEquip ? 'primary' : 'secondary'}
                      disabled={isEquipped || !canEquip}
                    >
                      {isEquipped ? 'Equipped' : 'Equip'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inventory */}
        {character.equipment.items.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold text-lg mb-3 heading-tertiary flex items-center">
              <Icon name="Backpack" size={20} className="mr-2 text-fg-accent" />
              Inventory
            </h3>
            <div className="space-y-2">
              {character.equipment.items.map((item, idx) => {
                const inCombat = combat !== null;
                const canUse = canUseItem(character, item, inCombat);
                const disabledReason = !canUse ? getItemDisabledReason(character, item, inCombat) : '';

                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-surface rounded p-3 body-primary"
                  >
                    <div className="flex-1">
                      <span>{item.name}</span>
                      <span className="text-fg-muted ml-2">×{item.quantity}</span>
                      {disabledReason && (
                        <span className="ml-2 text-fg-muted text-xs">({disabledReason})</span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleUseItem(item.id)}
                      variant={canUse ? 'primary' : 'secondary'}
                      disabled={!canUse}
                    >
                      Use
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// Equipment Item Component
interface EquipmentItemProps {
  icon: keyof typeof import('lucide-react').icons;
  label: string;
  value: string;
}

function EquipmentItem({ icon, label, value }: EquipmentItemProps) {
  return (
    <div className="flex justify-between items-center bg-surface rounded p-3 body-primary">
      <div className="flex items-center space-x-2">
        <Icon name={icon} size={20} className="text-fg-accent" />
        <span className="text-fg-muted body-secondary">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
