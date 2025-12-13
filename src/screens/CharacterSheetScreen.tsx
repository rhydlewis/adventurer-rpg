import { useState } from 'react';
import type { Character } from '../types/character';
import { calculateModifier } from '../utils/dice';
import { calculateSkillBonus } from '../utils/skills';
import type { SkillName } from '../types/skill';
import { Button, Card, StatusBar, Icon } from '../components';

interface CharacterSheetScreenProps {
  character: Character;
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

type AttributeKey = keyof typeof attributeIcons;
type TabType = 'overview' | 'skills' | 'combat' | 'equipment';

const formatModifier = (value: number): string => {
  return value >= 0 ? `+${value}` : `${value}`;
};

export function CharacterSheetScreen({ character, onClose }: CharacterSheetScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const skillNames: SkillName[] = ['Athletics', 'Stealth', 'Perception', 'Arcana', 'Medicine', 'Intimidate'];

  return (
    <div className="min-h-screen bg-primary text-text-primary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-display font-cinzel font-bold text-text-accent">{character.name}</h1>
            <p className="text-h2 text-text-secondary font-inter">
              Level {character.level} {character.class}
            </p>
          </div>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>

        {/* Tab Navigation */}
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
          <TabButton
            active={activeTab === 'equipment'}
            onClick={() => setActiveTab('equipment')}
            icon="Package"
          >
            Equipment
          </TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab character={character} />}
        {activeTab === 'skills' && <SkillsTab character={character} skillNames={skillNames} />}
        {activeTab === 'combat' && <CombatTab character={character} />}
        {activeTab === 'equipment' && <EquipmentTab character={character} />}
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
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-inter font-semibold transition-all min-h-[44px] ${
        active
          ? 'bg-player text-white shadow-lg'
          : 'bg-surface text-text-secondary hover:bg-surface/80 hover:text-text-primary'
      }`}
    >
      <Icon name={icon} size={20} />
      <span>{children}</span>
    </button>
  );
}

// Overview Tab
function OverviewTab({ character }: { character: Character }) {
  return (
    <div className="space-y-6">
      {/* HP and AC */}
      <Card variant="neutral">
        <div className="space-y-4">
          {/* HP Bar */}
          <StatusBar
            current={character.hp}
            max={character.maxHp}
            label="HP"
            showNumbers
          />

          {/* AC */}
          <div className="flex justify-between items-center bg-surface rounded-lg p-3">
            <span className="font-inter font-medium text-body text-text-primary">
              Armor Class
            </span>
            <span className="font-cinzel font-bold text-3xl text-text-accent">
              {character.ac}
            </span>
          </div>

          {/* BAB */}
          <div className="flex justify-between items-center bg-surface rounded-lg p-3">
            <span className="font-inter font-medium text-body text-text-primary">
              Base Attack Bonus
            </span>
            <span className="font-cinzel font-bold text-2xl text-text-accent">
              {formatModifier(character.bab)}
            </span>
          </div>
        </div>
      </Card>

      {/* Attributes */}
      <Card variant="neutral">
        <h2 className="text-h2 font-cinzel font-bold mb-4">Attributes</h2>
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
                  <div className="font-inter text-xs text-text-muted uppercase">
                    {attributeLabels[attr]}
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="font-cinzel font-bold text-2xl text-text-accent">
                      {score}
                    </span>
                    <span className="font-inter text-sm text-text-secondary">
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
        <h2 className="text-h2 font-cinzel font-bold mb-4">Saving Throws</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface rounded-lg p-4 text-center border border-border-default">
            <div className="font-inter text-xs text-text-muted mb-2">
              Fortitude
            </div>
            <div className="font-cinzel font-bold text-2xl text-success">
              {formatModifier(character.saves.fortitude)}
            </div>
          </div>
          <div className="bg-surface rounded-lg p-4 text-center border border-border-default">
            <div className="font-inter text-xs text-text-muted mb-2">
              Reflex
            </div>
            <div className="font-cinzel font-bold text-2xl text-warning">
              {formatModifier(character.saves.reflex)}
            </div>
          </div>
          <div className="bg-surface rounded-lg p-4 text-center border border-border-default">
            <div className="font-inter text-xs text-text-muted mb-2">
              Will
            </div>
            <div className="font-cinzel font-bold text-2xl text-magic">
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
  // Separate trained and untrained skills
  const trainedSkills = skillNames.filter(name => character.skills[name] > 0);
  const untrainedSkills = skillNames.filter(name => character.skills[name] === 0);

  return (
    <Card variant="neutral">
      <h2 className="text-h2 font-cinzel font-bold mb-4">Skills</h2>

      {/* Trained Skills */}
      {trainedSkills.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-inter font-semibold text-text-accent mb-2">
            Trained
          </h3>
          <div className="space-y-2">
            {trainedSkills.map((skillName) => {
              const skillBonus = calculateSkillBonus(character, skillName);
              return (
                <div
                  key={skillName}
                  className="flex justify-between items-center p-3 rounded bg-surface font-inter"
                >
                  <span className="font-semibold">{skillName}</span>
                  <span className="font-monospace text-lg text-text-accent">
                    {formatModifier(skillBonus.totalBonus)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Untrained Skills */}
      {untrainedSkills.length > 0 && (
        <div>
          <h3 className="text-sm font-inter font-semibold text-text-muted mb-2">
            Untrained
          </h3>
          <div className="space-y-2">
            {untrainedSkills.map((skillName) => {
              const skillBonus = calculateSkillBonus(character, skillName);
              return (
                <div
                  key={skillName}
                  className="flex justify-between items-center p-3 rounded bg-surface/30 font-inter text-text-muted"
                >
                  <span>{skillName}</span>
                  <span className="font-monospace text-lg">
                    {formatModifier(skillBonus.totalBonus)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

// Combat Tab
function CombatTab({ character }: { character: Character }) {
  return (
    <div className="space-y-6">
      {/* Feats */}
      {character.feats.length > 0 && (
        <Card variant="neutral">
          <h2 className="text-h2 font-cinzel font-bold mb-4">Feats</h2>
          <div className="space-y-3">
            {character.feats.map((feat, idx) => (
              <div key={idx} className="bg-surface rounded-lg p-4">
                <h3 className="font-bold text-lg mb-1 font-cinzel text-text-accent">
                  {feat.name}
                </h3>
                <p className="text-sm text-text-secondary font-inter">
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
          <h2 className="text-h2 font-cinzel font-bold mb-4">Abilities & Resources</h2>

          {/* Abilities */}
          {character.resources.abilities.length > 0 && (
            <div className="space-y-3 mb-4">
              {character.resources.abilities.map((ability, idx) => (
                <div key={idx} className="bg-surface rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg font-cinzel text-text-accent">
                      {ability.name}
                    </h3>
                    <span className="text-sm bg-primary px-2 py-1 rounded font-inter text-text-secondary">
                      {ability.currentUses}/{ability.maxUses} {ability.type}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary font-inter">
                    {ability.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Spell Slots */}
          {character.resources.spellSlots && (
            <div className="bg-surface rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2 font-cinzel">Spell Slots</h3>
              <div className="space-y-2 font-inter">
                <div className="flex justify-between">
                  <span>Cantrips (Level 0)</span>
                  <span className="text-text-muted">At-will</span>
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
    </div>
  );
}

// Equipment Tab
function EquipmentTab({ character }: { character: Character }) {
  return (
    <Card variant="neutral">
      <h2 className="text-h2 font-cinzel font-bold mb-4">Equipment</h2>

      {/* Equipped Items */}
      <div className="space-y-3 mb-4">
        <EquipmentItem
          icon="Sword"
          label="Weapon"
          value={character.equipment.weapon.name}
        />
        <EquipmentItem
          icon="Shield"
          label="Armor"
          value={character.equipment.armor.name}
        />
        {character.equipment.shield.equipped && (
          <EquipmentItem
            icon="ShieldAlert"
            label="Shield"
            value={`+${character.equipment.shield.acBonus} AC`}
          />
        )}
      </div>

      {/* Inventory */}
      {character.equipment.items.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3 font-cinzel flex items-center">
            <Icon name="Backpack" size={20} className="mr-2 text-text-accent" />
            Inventory
          </h3>
          <div className="space-y-2">
            {character.equipment.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-surface rounded p-3 font-inter"
              >
                <span>{item.name}</span>
                <span className="text-text-muted">×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
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
    <div className="flex justify-between items-center bg-surface rounded p-3 font-inter">
      <div className="flex items-center space-x-2">
        <Icon name={icon} size={20} className="text-text-accent" />
        <span className="text-text-muted">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
