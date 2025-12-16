import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { applyLevelUp, calculateHPIncrease, calculateBABIncrease } from '../utils/levelUp';
import type { Feat } from '../types/feat';

// TODO: Import from data/feats when implemented
const MOCK_FEATS: Record<string, Feat> = {
    'power-attack': {
        name: 'Power Attack',
        description: 'You can take a -2 penalty on attack rolls to gain a +4 bonus on damage rolls.',
        effect: { type: 'toggle', name: 'powerAttack' },
    },
    'improved-initiative': {
        name: 'Improved Initiative',
        description: 'You get a +4 bonus on initiative checks. This helps you act sooner in combat.',
        effect: { type: 'passive', stat: 'initiative', bonus: 4 },
    },
    'weapon-focus': {
        name: 'Weapon Focus',
        description: 'You get a +1 bonus on all attack rolls with a specific weapon (longsword by default).',
        effect: { type: 'passive', stat: 'attack', bonus: 1 },
    },
};

interface LevelUpScreenProps {
    newLevel: number;
    featChoices: string[]; // Feat IDs
    onComplete: () => void;
}

export function LevelUpScreen({newLevel, featChoices, onComplete}: LevelUpScreenProps) {
    const {character, setCharacter} = useCharacterStore();
    const [selectedFeatId, setSelectedFeatId] = useState<string | null>(null);

    if (!character) {
        return <div className="body-primary">No character loaded</div>;
    }

    const hpIncrease = calculateHPIncrease(character.class, character.attributes.CON);
    const babIncrease = calculateBABIncrease(character.class, character.level, newLevel);

    const handleConfirm = () => {
        if (!selectedFeatId) return;

        const chosenFeat = MOCK_FEATS[selectedFeatId];
        const updatedCharacter = applyLevelUp(character, newLevel, chosenFeat);
        setCharacter(updatedCharacter);
        onComplete();
    };

    return (
        <div className="min-h-screen bg-primary text-fg-primary p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <h1 className="heading-display text-text-accent mb-4 text-center">
                    Level Up!
                </h1>
                <p className="heading-primary text-center mb-8">
                    You've reached level {newLevel}
                </p>

                {/* Stat Increases */}
                <div className="bg-secondary p-6 rounded-lg border border-border mb-6">
                    <h2 className="heading-secondary mb-4">Stat Increases</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between body-primary">
                            <span>Hit Points:</span>
                            <span className="stat-medium text-healing">
                {character.maxHp} → {character.maxHp + hpIncrease} (+{hpIncrease})
              </span>
                        </div>
                        <div className="flex justify-between body-primary">
                            <span>Base Attack Bonus:</span>
                            <span className="stat-medium text-text-accent">
                +{character.bab} → +{character.bab + babIncrease} (+{babIncrease})
              </span>
                        </div>
                        <div className="body-secondary text-sm mt-4 p-3 bg-primary/50 rounded">
                            ✨ Your HP will be fully restored upon leveling up
                        </div>
                    </div>
                </div>

                {/* Feat Selection */}
                <div className="bg-secondary p-6 rounded-lg border border-border mb-6">
                    <h2 className="heading-secondary mb-4">Choose a Feat</h2>
                    <div className="space-y-3">
                        {featChoices.map((featId) => {
                            const feat = MOCK_FEATS[featId];
                            const isSelected = selectedFeatId === featId;

                            return (
                                <button
                                    key={featId}
                                    className={`w-full text-left p-4 rounded border transition-colors ${
                                        isSelected
                                            ? 'border-accent bg-accent/20'
                                            : 'border-border hover:border-accent/50'
                                    }`}
                                    onClick={() => setSelectedFeatId(featId)}
                                >
                                    <h3 className="feat-name text-text-accent mb-2">{feat.name}</h3>
                                    <p className="body-secondary text-sm mb-2">{feat.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    className={`button-text w-full py-4 rounded text-lg ${
                        selectedFeatId
                            ? 'bg-accent text-fg-inverted hover:bg-accent-hover'
                            : 'bg-muted text-text-muted cursor-not-allowed'
                    }`}
                    onClick={handleConfirm}
                    disabled={!selectedFeatId}
                >
                    {selectedFeatId ? 'Confirm Level Up' : 'Select a Feat'}
                </button>
            </div>
        </div>
    );
}