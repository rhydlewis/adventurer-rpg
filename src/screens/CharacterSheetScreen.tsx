import type { Character } from '../types/character';
import { calculateModifier } from '../utils/dice';
import { calculateSkillBonus } from '../utils/skills';
import type { SkillName } from '../types/skill';

interface CharacterSheetScreenProps {
  character: Character;
  onClose: () => void;
}

export function CharacterSheetScreen({ character, onClose }: CharacterSheetScreenProps) {
  const skillNames: SkillName[] = ['Athletics', 'Stealth', 'Perception', 'Arcana', 'Medicine', 'Intimidate'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold">{character.name}</h1>
            <p className="text-xl text-gray-300">
              Level {character.level} {character.class}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatBox label="Hit Points" value={`${character.hp} / ${character.maxHp}`} />
          <StatBox label="Armor Class" value={character.ac.toString()} />
          <StatBox label="Base Attack Bonus" value={`+${character.bab}`} />
        </div>

        {/* Attributes */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Attributes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(character.attributes).map(([attr, value]) => {
              const modifier = calculateModifier(value);
              return (
                <div key={attr} className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-400 mb-1">{attr}</div>
                  <div className="text-3xl font-bold">{value}</div>
                  <div className="text-lg text-gray-300">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saves */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Saving Throws</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SaveBox label="Fortitude" value={character.saves.fortitude} />
            <SaveBox label="Reflex" value={character.saves.reflex} />
            <SaveBox label="Will" value={character.saves.will} />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Skills</h2>
          <div className="space-y-2">
            {skillNames.map((skillName) => {
              const skillBonus = calculateSkillBonus(character, skillName);
              const hasRanks = character.skills[skillName] > 0;
              return (
                <div
                  key={skillName}
                  className={`flex justify-between items-center p-3 rounded ${
                    hasRanks ? 'bg-gray-700' : 'bg-gray-900/50'
                  }`}
                >
                  <span className={hasRanks ? 'font-semibold' : 'text-gray-400'}>
                    {skillName}
                  </span>
                  <span className="font-mono text-lg">
                    {skillBonus.totalBonus >= 0 ? '+' : ''}{skillBonus.totalBonus}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feats */}
        {character.feats.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Feats</h2>
            <div className="space-y-3">
              {character.feats.map((feat, idx) => (
                <div key={idx} className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-1">{feat.name}</h3>
                  <p className="text-sm text-gray-300">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Equipment</h2>
          <div className="space-y-3">
            <EquipmentItem label="Weapon" value={character.equipment.weapon.name} />
            <EquipmentItem label="Armor" value={character.equipment.armor.name} />
            {character.equipment.shield.equipped && (
              <EquipmentItem label="Shield" value={`+${character.equipment.shield.acBonus} AC`} />
            )}
          </div>

          {character.equipment.items.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2">Items</h3>
              <div className="space-y-2">
                {character.equipment.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-700 rounded p-3">
                    <span>{item.name}</span>
                    <span className="text-gray-400">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resources & Abilities */}
        {(character.resources.abilities.length > 0 || character.resources.spellSlots) && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Abilities & Resources</h2>

            {character.resources.abilities.length > 0 && (
              <div className="space-y-3 mb-4">
                {character.resources.abilities.map((ability, idx) => (
                  <div key={idx} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{ability.name}</h3>
                      <span className="text-sm bg-gray-600 px-2 py-1 rounded">
                        {ability.currentUses}/{ability.maxUses} {ability.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{ability.description}</p>
                  </div>
                ))}
              </div>
            )}

            {character.resources.spellSlots && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">Spell Slots</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cantrips (Level 0)</span>
                    <span className="text-gray-400">At-will</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 1</span>
                    <span>
                      {character.resources.spellSlots.level1.current}/
                      {character.resources.spellSlots.level1.max}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components
function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-center">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function SaveBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 text-center">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold">
        {value >= 0 ? '+' : ''}{value}
      </div>
    </div>
  );
}

function EquipmentItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center bg-gray-700 rounded p-3">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
