import { useCharacterStore } from '../stores/characterStore';
import { CLASSES } from '../data/classes';
import { FIGHTER_STARTING_FEATS } from '../data/feats';
import { getRemainingPoints, isValidAllocation } from '../utils/pointBuy';
import type { CharacterClass } from '../types/character';
import type { Attributes } from '../types/attributes';
import type { SkillName } from '../types/skill';
import type { FeatName } from '../types/feat';

export function CharacterCreationScreen() {
  const {
    creationStep,
    creationData,
    setClass,
    setAttributes,
    setSkillRanks,
    setFeat,
    setName,
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
        onChange={setName}
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-2">Choose Your Class</h1>
        <p className="text-gray-300 mb-8">Select the class that fits your playstyle</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {classes.map((className) => {
            const classDef = CLASSES[className];
            const isSelected = selected === className;
            return (
              <button
                key={className}
                onClick={() => handleSelect(className)}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <h2 className="text-2xl font-bold mb-2">{className}</h2>
                <p className="text-sm text-gray-300 mb-4">{classDef.description}</p>
                <div className="text-xs text-gray-400">
                  <div>HP: {classDef.baseHP} | AC: ~{classDef.startingArmor === 'Chainmail' ? '18' : classDef.startingArmor === 'Leather' ? '15' : '12'}</div>
                  <div>BAB: +{classDef.baseBab}</div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onNext}
          disabled={!selected}
          className="w-full px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Next: Allocate Attributes
        </button>
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-xl w-full">
        <h1 className="text-4xl font-bold mb-2">Allocate Attributes</h1>
        <p className="text-gray-300 mb-4">You have 27 points to spend</p>
        <div className="mb-6 text-xl">
          Points Remaining: <span className={remaining < 0 ? 'text-red-500' : 'text-green-500'}>{remaining}</span>
        </div>

        <div className="space-y-4 mb-8">
          {attributeNames.map((attr) => (
            <div key={attr} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
              <span className="font-bold text-lg w-16">{attr}</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => adjustAttribute(attr, -1)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-12 text-center">{attributes[attr]}</span>
                <button
                  onClick={() => adjustAttribute(attr, 1)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!isValid}
            className="flex-1 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Next: Allocate Skills
          </button>
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
  const maxRanks = 8; // At level 1, can distribute up to 8 ranks total

  const adjustSkill = (skill: SkillName, delta: number) => {
    const newValue = skills[skill] + delta;
    if (newValue >= 0 && newValue <= 4) {
      // Max 4 ranks in any skill at level 1
      onChange({ ...skills, [skill]: newValue });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-xl w-full">
        <h1 className="text-4xl font-bold mb-2">Allocate Skill Ranks</h1>
        <p className="text-gray-300 mb-4">Distribute ranks (max 4 per skill, 8 total)</p>
        <div className="mb-6 text-xl">
          Ranks Used: <span className={totalRanks > maxRanks ? 'text-red-500' : 'text-green-500'}>{totalRanks}/{maxRanks}</span>
        </div>

        <div className="space-y-4 mb-8">
          {skillNames.map((skill) => (
            <div key={skill} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
              <span className="font-bold text-lg flex-1">{skill}</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => adjustSkill(skill, -1)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-12 text-center">{skills[skill]}</span>
                <button
                  onClick={() => adjustSkill(skill, 1)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={totalRanks > maxRanks}
            className="flex-1 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {className === 'Fighter' ? 'Next: Choose Feat' : 'Next: Enter Name'}
          </button>
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-xl w-full">
        <h1 className="text-4xl font-bold mb-2">Choose a Combat Feat</h1>
        <p className="text-gray-300 mb-8">Fighters get a bonus feat at level 1</p>

        <div className="space-y-4 mb-8">
          {FIGHTER_STARTING_FEATS.map((featName) => {
            const feat = FEATS[featName];
            const isSelected = selectedFeat === featName;
            return (
              <button
                key={featName}
                onClick={() => onSelect(featName)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <h3 className="font-bold text-lg mb-1">{feat.name}</h3>
                <p className="text-sm text-gray-300">{feat.description}</p>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!selectedFeat}
            className="flex-1 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Next: Enter Name
          </button>
        </div>
      </div>
    </div>
  );
}

// Name Entry Step
function NameEntryStep({
  name,
  onChange,
  onFinalize,
  onBack,
}: {
  name: string;
  onChange: (name: string) => void;
  onFinalize: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-xl w-full">
        <h1 className="text-4xl font-bold mb-2">Name Your Hero</h1>
        <p className="text-gray-300 mb-8">Choose a name for your adventurer</p>

        <input
          type="text"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter character name..."
          className="w-full px-4 py-3 mb-8 bg-gray-800 border-2 border-gray-600 rounded-lg text-white text-lg focus:border-blue-500 focus:outline-none"
          autoFocus
        />

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onFinalize}
            className="flex-1 px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Character
          </button>
        </div>
      </div>
    </div>
  );
}

// Import React useState
import { useState } from 'react';
import { FEATS } from '../data/feats';
