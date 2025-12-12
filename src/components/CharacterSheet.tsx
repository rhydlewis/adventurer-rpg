import type { Character } from '../types';
import { Card, StatusBar, Badge } from './index';
import Icon from './Icon';

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

// Icon mapping for each attribute (using Lucide icon names)
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

/**
 * CharacterSheet component displays a D&D character's complete stats.
 *
 * Features:
 * - Mobile-first responsive card layout
 * - Character avatar with fallback
 * - HP/AC display with StatusBar
 * - 6 core attributes with Lucide icons
 * - Active buffs and debuffs using Badge component
 * - Saving throws
 * - Follows Adventurer RPG design system
 *
 * @example
 * <CharacterSheet character={playerCharacter} />
 */
export function CharacterSheet({ character }: CharacterSheetProps) {
  const buffs = character.effects?.filter(e => e.type === 'buff') || [];
  const debuffs = character.effects?.filter(e => e.type === 'debuff') || [];

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Character Header Card */}
      <Card variant="player" padding="default">
        <div className="space-y-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center overflow-hidden mb-3 border-2 border-player">
              {character.avatarUrl ? (
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon name="Swords" size={48} className="text-text-accent" aria-hidden="true" />
              )}
            </div>

            {/* Character Name and Class */}
            <h2 className="font-cinzel font-bold text-display text-text-accent text-center">
              {character.name}
            </h2>
            <p className="font-inter font-medium text-body text-text-primary">
              Level {character.level} {character.class}
            </p>
          </div>

          {/* HP and AC Stats */}
          <div className="space-y-3">
            <StatusBar
              current={character.hp}
              max={character.maxHp}
              label="HP"
              showNumbers
            />

            <div className="flex justify-between items-center bg-secondary rounded-lg p-3">
              <span className="font-inter font-medium text-body text-text-primary">
                Armor Class
              </span>
              <span className="font-inter font-bold text-h1 text-player">
                {character.ac}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Attributes Card */}
      <Card variant="neutral" padding="default">
        <h3 className="font-inter font-semibold text-h1 text-text-primary mb-3">
          Attributes
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(attributeIcons) as AttributeKey[]).map((attr) => {
            const iconName = attributeIcons[attr];
            const score = character.attributes[attr];
            const modifier = getAbilityModifier(score);

            return (
              <div
                key={attr}
                className="bg-primary rounded-lg p-3 flex items-center space-x-3 border border-border-default"
              >
                <div className="bg-secondary p-2 rounded-lg">
                  <Icon name={iconName} size={20} className="text-player" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="font-inter text-caption text-text-primary/70">
                    {attributeLabels[attr]}
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="font-inter font-bold text-h1 text-text-primary">
                      {score}
                    </span>
                    <span className="font-inter text-body text-text-primary/60">
                      ({formatModifier(modifier)})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Saving Throws Card */}
      <Card variant="neutral" padding="default">
        <h3 className="font-inter font-semibold text-h1 text-text-primary mb-3">
          Saving Throws
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary rounded-lg p-3 text-center border border-border-default">
            <div className="font-inter text-caption text-text-primary/70 mb-1">
              Fortitude
            </div>
            <div className="font-inter font-bold text-h1 text-success">
              {formatModifier(character.saves.fortitude)}
            </div>
          </div>
          <div className="bg-primary rounded-lg p-3 text-center border border-border-default">
            <div className="font-inter text-caption text-text-primary/70 mb-1">
              Reflex
            </div>
            <div className="font-inter font-bold text-h1 text-warning">
              {formatModifier(character.saves.reflex)}
            </div>
          </div>
          <div className="bg-primary rounded-lg p-3 text-center border border-border-default">
            <div className="font-inter text-caption text-text-primary/70 mb-1">
              Will
            </div>
            <div className="font-inter font-bold text-h1 text-magic">
              {formatModifier(character.saves.will)}
            </div>
          </div>
        </div>
      </Card>

      {/* Active Effects Card */}
      {(buffs.length > 0 || debuffs.length > 0) && (
        <Card variant="neutral" padding="default">
          <h3 className="font-inter font-semibold text-h1 text-text-primary mb-3">
            Active Effects
          </h3>

          {/* Buffs */}
          {buffs.length > 0 && (
            <div className="mb-3">
              <div className="font-inter font-medium text-body text-success mb-2 flex items-center">
                <Icon name="TrendingUp" size={16} className="mr-1.5" aria-hidden="true" />
                Buffs
              </div>
              <div className="flex flex-wrap gap-2">
                {buffs.map((buff) => (
                  <Badge
                    key={buff.id}
                    type="buff"
                    duration={buff.duration}
                    icon={<Icon name="ArrowUp" size={14} />}
                  >
                    {buff.name}: {buff.description}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Debuffs */}
          {debuffs.length > 0 && (
            <div>
              <div className="font-inter font-medium text-body text-enemy mb-2 flex items-center">
                <Icon name="TrendingDown" size={16} className="mr-1.5" aria-hidden="true" />
                Debuffs
              </div>
              <div className="flex flex-wrap gap-2">
                {debuffs.map((debuff) => (
                  <Badge
                    key={debuff.id}
                    type="debuff"
                    duration={debuff.duration}
                    icon={<Icon name="ArrowDown" size={14} />}
                  >
                    {debuff.name}: {debuff.description}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
