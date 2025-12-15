import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { CLASSES } from '../data/classes';
import { FIGHTER_STARTING_FEATS, FEATS } from '../data/feats';
import { AVAILABLE_AVATARS } from '../data/avatars';
import { getRemainingPoints, isValidAllocation } from '../utils/pointBuy';
import type { CharacterClass } from '../types/character';
import type { Attributes } from '../types/attributes';
import type { SkillName } from '../types/skill';
import type { FeatName } from '../types/feat';
import { Button, Card, Icon } from '../components';

// Attribute icon mapping (reused from CharacterSheet)
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

// Skill icon mapping (reused from CharacterSheet)
const skillIcons = {
  Athletics: 'Dumbbell' as const,
  Stealth: 'EyeOff' as const,
  Perception: 'Eye' as const,
  Arcana: 'Sparkles' as const,
  Medicine: 'Heart' as const,
  Intimidate: 'Flame' as const,
};

export function CharacterCreationScreen() {
  const {
    creationStep,
    creationData,
    setClass,
    setAttributes,
    setSkillRanks,
    setFeat,
    setName,
    setAvatarPath,
    nextStep,
    previousStep,
    finalizeCharacter,
  } = useCharacterStore();

  if (creationStep === 'class') {
    return <ClassSelectionStep onSelect={setClass} onNext={nextStep} />;
  }

  if (creationStep === 'attributes') {
    return (
      <AttributeAllocationStep
        attributes={creationData.attributes}
        onChange={setAttributes}
        onNext={nextStep}
        onBack={previousStep}
      />
    );
  }

  if (creationStep === 'skills') {
    return (
      <SkillAllocationStep
        className={creationData.class!}
        skills={creationData.skillRanks}
        onChange={setSkillRanks}
        onNext={nextStep}
        onBack={previousStep}
      />
    );
  }

  if (creationStep === 'feat' && creationData.class === 'Fighter') {
    return (
      <FeatSelectionStep
        selectedFeat={creationData.selectedFeat}
        onSelect={setFeat}
        onNext={nextStep}
        onBack={previousStep}
      />
    );
  }

  if (creationStep === 'name') {
    return (
      <NameEntryStep
        name={creationData.name}
        avatarPath={creationData.avatarPath}
        onNameChange={setName}
        onAvatarChange={setAvatarPath}
        onFinalize={finalizeCharacter}
        onBack={previousStep}
      />
    );
  }

  return null;
}

// Class Selection Step
function ClassSelectionStep({
  onSelect,
  onNext,
}: {
  onSelect: (c: CharacterClass) => void;
  onNext: () => void;
}) {
  const classes: CharacterClass[] = ['Fighter', 'Rogue', 'Wizard', 'Cleric'];
  const [selected, setSelected] = useState<CharacterClass | null>(null);

  const handleSelect = (className: CharacterClass) => {
    setSelected(className);
    onSelect(className);
  };

  const classIcons = {
    Fighter: 'Swords' as const,
    Rogue: 'Target' as const,
    Wizard: 'Sparkles' as const,
    Cleric: 'Cross' as const,
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-text-primary p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-display heading-display mb-2 text-text-accent">Choose Your Class</h1>
        <p className="text-text-secondary mb-8 body-secondary">Select the class that fits your playstyle</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {classes.map((className) => {
            const classDef = CLASSES[className];
            const isSelected = selected === className;
            const iconName = classIcons[className];
            return (
              <button
                key={className}
                onClick={() => handleSelect(className)}
                className={`p-6 rounded-lg border-2 text-left transition-all min-h-[44px] ${
                  isSelected
                    ? 'border-player bg-player/20 shadow-lg'
                    : 'border-border-default bg-surface hover:border-player/50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Icon name={iconName} size={32} className={isSelected ? 'text-player' : 'text-text-accent'} />
                  <h2 className="text-2xl character-name text-text-accent">{className}</h2>
                </div>
                <p className="text-sm text-text-secondary mb-4 body-secondary">{classDef.description}</p>
                <div className="text-xs text-text-muted body-secondary">
                  <div>HP: {classDef.baseHP} | BAB: +{classDef.baseBab}</div>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={onNext}
          disabled={!selected}
          variant="primary"
          fullWidth
          className="text-lg"
        >
          Next: Allocate Attributes
        </Button>
      </div>
    </div>
  );
}

// Attribute Allocation Step
function AttributeAllocationStep({
  attributes,
  onChange,
  onNext,
  onBack,
}: {
  attributes: Attributes;
  onChange: (attrs: Attributes) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const remaining = getRemainingPoints(attributes);
  const isValid = isValidAllocation(attributes);

  const adjustAttribute = (attr: keyof Attributes, delta: number) => {
    const newValue = attributes[attr] + delta;
    if (newValue >= 7 && newValue <= 18) {
      onChange({ ...attributes, [attr]: newValue });
    }
  };

  const attributeNames: (keyof Attributes)[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-text-primary p-4">
      <div className="max-w-xl w-full">
        <h1 className="text-display heading-display mb-2 text-text-accent">Allocate Attributes</h1>
        <p className="text-text-secondary mb-4 body-secondary">You have 27 points to spend</p>
        <div className="mb-6 text-h1 body-primary">
          Points Remaining:{' '}
          <span className={`font-bold ${remaining < 0 ? 'text-enemy' : remaining === 0 ? 'text-success' : 'text-text-accent'}`}>
            {remaining}
          </span>
        </div>

        <div className="space-y-3 mb-8">
          {attributeNames.map((attr) => {
            const iconName = attributeIcons[attr];
            const label = attributeLabels[attr];
            return (
              <Card key={attr} variant="neutral">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary p-2 rounded-lg">
                      <Icon name={iconName} size={24} className="text-player" />
                    </div>
                    <span className="skill-name text-lg text-text-primary w-32">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustAttribute(attr, -1)}
                      className="w-10 h-10 bg-surface hover:bg-surface/80 rounded font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="text-3xl attribute-value w-12 text-center text-text-accent">
                      {attributes[attr]}
                    </span>
                    <button
                      onClick={() => adjustAttribute(attr, 1)}
                      className="w-10 h-10 bg-surface hover:bg-surface/80 rounded font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-4">
          <Button onClick={onBack} variant="secondary" fullWidth>
            Back
          </Button>
          <Button onClick={onNext} disabled={!isValid} variant="primary" fullWidth>
            Next: Allocate Skills
          </Button>
        </div>
      </div>
    </div>
  );
}

// Skill Allocation Step
function SkillAllocationStep({
  className,
  skills,
  onChange,
  onNext,
  onBack,
}: {
  className: CharacterClass;
  skills: import('../types').SkillRanks;
  onChange: (skills: import('../types').SkillRanks) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const skillNames: SkillName[] = ['Athletics', 'Stealth', 'Perception', 'Arcana', 'Medicine', 'Intimidate'];
  const totalRanks = Object.values(skills).reduce((sum, ranks) => sum + ranks, 0);
  const maxRanks = 8;

  const adjustSkill = (skill: SkillName, delta: number) => {
    const newValue = skills[skill] + delta;
    if (newValue >= 0 && newValue <= 4) {
      onChange({ ...skills, [skill]: newValue });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-text-primary p-4">
      <div className="max-w-xl w-full">
        <h1 className="text-display heading-display mb-2 text-text-accent">Allocate Skill Ranks</h1>
        <p className="text-text-secondary mb-4 body-secondary">Distribute ranks (max 4 per skill, 8 total)</p>
        <div className="mb-6 text-h1 body-primary">
          Ranks Used:{' '}
          <span className={`font-bold ${totalRanks > maxRanks ? 'text-enemy' : totalRanks === maxRanks ? 'text-success' : 'text-text-accent'}`}>
            {totalRanks}/{maxRanks}
          </span>
        </div>

        <div className="space-y-3 mb-8">
          {skillNames.map((skill) => {
            const iconName = skillIcons[skill as keyof typeof skillIcons];
            return (
              <Card key={skill} variant="neutral">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary p-2 rounded-lg">
                      <Icon name={iconName} size={24} className="text-player" />
                    </div>
                    <span className="skill-name text-lg text-text-primary flex-1">{skill}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustSkill(skill, -1)}
                      className="w-10 h-10 bg-surface hover:bg-surface/80 rounded font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="text-3xl attribute-value w-12 text-center text-text-accent">
                      {skills[skill]}
                    </span>
                    <button
                      onClick={() => adjustSkill(skill, 1)}
                      className="w-10 h-10 bg-surface hover:bg-surface/80 rounded font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-4">
          <Button onClick={onBack} variant="secondary" fullWidth>
            Back
          </Button>
          <Button onClick={onNext} disabled={totalRanks > maxRanks} variant="primary" fullWidth>
            {className === 'Fighter' ? 'Next: Choose Feat' : 'Next: Enter Name'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Feat Selection Step (Fighter only)
function FeatSelectionStep({
  selectedFeat,
  onSelect,
  onNext,
  onBack,
}: {
  selectedFeat: FeatName | null;
  onSelect: (feat: FeatName) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-text-primary p-4">
      <div className="max-w-xl w-full">
        <h1 className="text-display heading-display mb-2 text-text-accent">Choose a Combat Feat</h1>
        <p className="text-text-secondary mb-8 body-secondary">Fighters get a bonus feat at level 1</p>

        <div className="space-y-3 mb-8">
          {FIGHTER_STARTING_FEATS.map((featName) => {
            const feat = FEATS[featName];
            const isSelected = selectedFeat === featName;
            return (
              <button
                key={featName}
                onClick={() => onSelect(featName)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all min-h-[44px] ${
                  isSelected
                    ? 'border-player bg-player/20 shadow-lg'
                    : 'border-border-default bg-surface hover:border-player/50'
                }`}
              >
                <h3 className="feat-name text-lg mb-1 text-text-accent">{feat.name}</h3>
                <p className="text-sm text-text-secondary body-secondary">{feat.description}</p>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4">
          <Button onClick={onBack} variant="secondary" fullWidth>
            Back
          </Button>
          <Button onClick={onNext} disabled={!selectedFeat} variant="primary" fullWidth>
            Next: Enter Name
          </Button>
        </div>
      </div>
    </div>
  );
}

// Name Entry Step
function NameEntryStep({
  name,
  avatarPath,
  onNameChange,
  onAvatarChange,
  onFinalize,
  onBack,
}: {
  name: string;
  avatarPath: string;
  onNameChange: (name: string) => void;
  onAvatarChange: (path: string) => void;
  onFinalize: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-text-primary p-4">
      <div className="max-w-xl w-full">
        <h1 className="text-display heading-display mb-2 text-text-accent">Name Your Hero</h1>
        <p className="text-text-secondary mb-8 body-secondary">Choose an avatar and name for your adventurer</p>

        {/* Avatar Selection Grid */}
        <div className="mb-6">
          <h2 className="text-lg heading-tertiary mb-3 text-text-primary">Choose Avatar</h2>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
            {AVAILABLE_AVATARS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => onAvatarChange(avatar)}
                className={`rounded-lg overflow-hidden transition-all ${
                  avatarPath === avatar
                    ? 'ring-4 ring-accent'
                    : 'ring-2 ring-border-primary hover:ring-accent'
                }`}
              >
                <img
                  src={`/assets/avatars/${avatar}`}
                  alt="Character avatar"
                  className="w-20 h-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-8">
          <h2 className="text-lg heading-tertiary mb-3 text-text-primary">Enter Name</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter character name..."
            className="w-full px-4 py-3 bg-surface border-2 border-border-default rounded-lg text-text-primary text-lg input-text focus:border-player focus:outline-none transition-colors"
            autoFocus
          />
        </div>

        <div className="flex gap-4">
          <Button onClick={onBack} variant="secondary" fullWidth>
            Back
          </Button>
          <Button onClick={onFinalize} variant="primary" fullWidth className="bg-success hover:bg-success/90">
            Create Character
          </Button>
        </div>
      </div>
    </div>
  );
}
