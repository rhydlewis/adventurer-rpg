import type { Character } from '../types/character';
import { calculateModifier } from '../utils/dice';
import { calculateSkillBonus } from '../utils/skills';
import type { SkillName } from '../types/skill';
import { Button, Card } from '../components';

interface CharacterSheetScreenProps {
  character: Character;
  onClose: () => void;
}

export function CharacterSheetScreen({ character, onClose }: CharacterSheetScreenProps) {
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

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatBox label="Hit Points" value={`${character.hp} / ${character.maxHp}`} />
          <StatBox label="Armor Class" value={character.ac.toString()} />
          <StatBox label="Base Attack Bonus" value={`+${character.bab}`} />
        </div>

        {/* Attributes */}
        <Card variant="neutral" className="mb-6">
          <h2 className="text-h2 font-cinzel font-bold mb-4">Attributes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(character.attributes).map(([attr, value]) => {
              const modifier = calculateModifier(value);
              return (
                <div key={attr} className="bg-surface rounded-lg p-4 text-center">
                  <div className="text-sm text-text-muted mb-1 font-inter uppercase">{attr}</div>
                  <div className="text-3xl font-cinzel font-bold text-text-accent">{value}</div>
                  <div className="text-lg text-text-secondary font-inter">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Saves */}
        <Card variant="neutral" className="mb-6">
          <h2 className="text-h2 font-cinzel font-bold mb-4">Saving Throws</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SaveBox label="Fortitude" value={character.saves.fortitude} />
            <SaveBox label="Reflex" value={character.saves.reflex} />
            <SaveBox label="Will" value={character.saves.will} />
          </div>
        </Card>

        {/* Skills */}
        <Card variant="neutral" className="mb-6">
          <h2 className="text-h2 font-cinzel font-bold mb-4">Skills</h2>
          <div className="space-y-2">
            {skillNames.map((skillName) => {
              const skillBonus = calculateSkillBonus(character, skillName);
              const hasRanks = character.skills[skillName] > 0;
              return (
                <div
                  key={skillName}
                  className={`flex justify-between items-center p-3 rounded font-inter ${
                    hasRanks ? 'bg-surface font-semibold' : 'bg-surface/30 text-text-muted'
                  }`}
                >
                  <span>{skillName}</span>
                  <span className="font-monospace text-lg">
                    {skillBonus.totalBonus >= 0 ? '+' : ''}{skillBonus.totalBonus}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Feats */}
        {character.feats.length > 0 && (
          <Card variant="neutral" className="mb-6">
            <h2 className="text-h2 font-cinzel font-bold mb-4">Feats</h2>
            <div className="space-y-3">
              {character.feats.map((feat, idx) => (
                <div key={idx} className="bg-surface rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-1 font-cinzel text-text-accent">{feat.name}</h3>
                  <p className="text-sm text-text-secondary font-inter">{feat.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Equipment */}
        <Card variant="neutral" className="mb-6">
          <h2 className="text-h2 font-cinzel font-bold mb-4">Equipment</h2>
          <div className="space-y-3">
            <EquipmentItem label="Weapon" value={character.equipment.weapon.name} />
            <EquipmentItem label="Armor" value={character.equipment.armor.name} />
            {character.equipment.shield.equipped && (
              <EquipmentItem label="Shield" value={`+${character.equipment.shield.acBonus} AC`} />
            )}
          </div>

          {character.equipment.items.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2 font-cinzel">Items</h3>
              <div className="space-y-2">
                {character.equipment.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-surface rounded p-3 font-inter">
                    <span>{item.name}</span>
                    <span className="text-text-muted">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Resources & Abilities */}
        {(character.resources.abilities.length > 0 || character.resources.spellSlots) && (
          <Card variant="neutral" className="mb-6">
            <h2 className="text-h2 font-cinzel font-bold mb-4">Abilities & Resources</h2>

            {character.resources.abilities.length > 0 && (
              <div className="space-y-3 mb-4">
                {character.resources.abilities.map((ability, idx) => (
                  <div key={idx} className="bg-surface rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg font-cinzel text-text-accent">{ability.name}</h3>
                      <span className="text-sm bg-primary px-2 py-1 rounded font-inter text-text-secondary">
                        {ability.currentUses}/{ability.maxUses} {ability.type}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary font-inter">{ability.description}</p>
                  </div>
                ))}
              </div>
            )}

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
    </div>
  );
}

// Helper components
function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="neutral" className="text-center">
      <div className="text-sm text-text-muted mb-1 font-inter">{label}</div>
      <div className="text-3xl font-cinzel font-bold text-text-accent">{value}</div>
    </Card>
  );
}

function SaveBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface rounded-lg p-4 text-center">
      <div className="text-sm text-text-muted mb-1 font-inter">{label}</div>
      <div className="text-2xl font-cinzel font-bold text-text-accent">
        {value >= 0 ? '+' : ''}{value}
      </div>
    </div>
  );
}

function EquipmentItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center bg-surface rounded p-3 font-inter">
      <span className="text-text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
