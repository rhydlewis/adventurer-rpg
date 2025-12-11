import { Sword, Zap, Heart, Brain, Eye, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import type { Character, Attribute } from '../types';

interface CharacterSheetProps {
  character: Character;
}

// Calculate ability modifier (D&D standard: (score - 10) / 2, rounded down)
const getAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

// Icon mapping for each attribute
const attributeIcons = {
  STR: Sword,
  DEX: Zap,
  CON: Heart,
  INT: Brain,
  WIS: Eye,
  CHA: Sparkles,
};

const attributeLabels = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

export function CharacterSheet({ character }: CharacterSheetProps) {
  const buffs = character.effects?.filter(e => e.type === 'buff') || [];
  const debuffs = character.effects?.filter(e => e.type === 'debuff') || [];

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      {/* Character Header */}
      <div className="relative">
        {/* Avatar */}
        <div className="w-full h-64 bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
          {character.avatarUrl ? (
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-6xl text-gray-400">⚔️</span>
            </div>
          )}
        </div>

        {/* Character Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent p-4">
          <h2 className="text-3xl font-bold text-white">{character.name}</h2>
          <p className="text-gray-300">
            Level {character.level} {character.class}
          </p>
        </div>
      </div>

      {/* HP and AC */}
      <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-700">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400 mb-1">Hit Points</div>
          <div className="text-2xl font-bold text-red-400">
            {character.hp} / {character.maxHp}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400 mb-1">Armor Class</div>
          <div className="text-2xl font-bold text-blue-400">{character.ac}</div>
        </div>
      </div>

      {/* Attributes */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Attributes</h3>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(attributeIcons) as Attribute[]).map((attr) => {
            const Icon = attributeIcons[attr];
            const score = character.attributes[attr];
            const modifier = getAbilityModifier(score);

            return (
              <div
                key={attr}
                className="bg-gray-800/50 rounded-lg p-3 flex items-center space-x-3"
              >
                <div className="bg-gray-700 p-2 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">{attributeLabels[attr]}</div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-bold text-white">{score}</span>
                    <span className="text-sm text-gray-400">
                      ({formatModifier(modifier)})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buffs and Debuffs */}
      {(buffs.length > 0 || debuffs.length > 0) && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Active Effects</h3>

          {/* Buffs */}
          {buffs.length > 0 && (
            <div className="mb-3">
              <div className="text-sm text-green-400 font-medium mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Buffs
              </div>
              <div className="space-y-2">
                {buffs.map((buff) => (
                  <div
                    key={buff.id}
                    className="bg-green-900/20 border border-green-700/30 rounded-lg p-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-300">
                          {buff.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {buff.description}
                        </div>
                      </div>
                      {buff.duration && (
                        <div className="text-xs text-green-400 ml-2">
                          {buff.duration}t
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debuffs */}
          {debuffs.length > 0 && (
            <div>
              <div className="text-sm text-red-400 font-medium mb-2 flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                Debuffs
              </div>
              <div className="space-y-2">
                {debuffs.map((debuff) => (
                  <div
                    key={debuff.id}
                    className="bg-red-900/20 border border-red-700/30 rounded-lg p-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-300">
                          {debuff.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {debuff.description}
                        </div>
                      </div>
                      {debuff.duration && (
                        <div className="text-xs text-red-400 ml-2">
                          {debuff.duration}t
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saving Throws */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Saving Throws</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">Fort</div>
            <div className="text-lg font-bold text-white">
              {formatModifier(character.saves.fortitude)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">Reflex</div>
            <div className="text-lg font-bold text-white">
              {formatModifier(character.saves.reflex)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">Will</div>
            <div className="text-lg font-bold text-white">
              {formatModifier(character.saves.will)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
