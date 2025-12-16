import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { applyLevelUp, calculateHPIncrease, calculateBABIncrease } from '../utils/levelUp';
import type { Feat } from '../types/feat';
import { Icon } from '../components';

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
        return <div className="min-h-screen bg-primary text-fg-primary flex items-center justify-center">
            <div className="text-center">
                <Icon name="Info" size={48} className="text-enemy mx-auto mb-4" />
                <p className="body-primary">No character loaded</p>
            </div>
        </div>;
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-fg-primary p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/20 border-2 border-warning mb-4">
                        <Icon name="Trophy" size={40} className="text-warning" />
                    </div>
                    <h1 className="heading-display text-fg-accent mb-2">
                        Level Up!
                    </h1>
                    <p className="heading-primary text-fg-muted">
                        You've reached level {newLevel}
                    </p>
                </div>

                {/* Stat Increases */}
                <div className="bg-gradient-to-br from-secondary to-secondary/50 p-6 rounded-xl border-2 border-success/30 mb-6">
                    <h2 className="heading-secondary mb-4 flex items-center gap-2">
                        <Icon name="TrendingUp" size={24} className="text-success" />
                        Stat Increases
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center body-primary p-3 bg-primary/30 rounded-lg">
                            <span className="flex items-center gap-2">
                                <Icon name="Heart" size={18} className="text-success" />
                                Hit Points:
                            </span>
                            <span className="stat-medium text-success font-bold">
                                {character.maxHp} → {character.maxHp + hpIncrease} <span className="text-success/70">(+{hpIncrease})</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center body-primary p-3 bg-primary/30 rounded-lg">
                            <span className="flex items-center gap-2">
                                <Icon name="Swords" size={18} className="text-warning" />
                                Base Attack Bonus:
                            </span>
                            <span className="stat-medium text-warning font-bold">
                                +{character.bab} → +{character.bab + babIncrease} <span className="text-warning/70">(+{babIncrease})</span>
                            </span>
                        </div>
                        <div className="body-secondary text-sm mt-4 p-3 bg-success/10 border border-success/30 rounded-lg flex items-start gap-2">
                            <Icon name="Info" size={16} className="text-success flex-shrink-0 mt-0.5" />
                            <span>Your HP will be fully restored upon leveling up</span>
                        </div>
                    </div>
                </div>

                {/* Feat Selection */}
                <div className="bg-gradient-to-br from-secondary to-secondary/50 p-6 rounded-xl border-2 border-magic/30 mb-6">
                    <h2 className="heading-secondary mb-4 flex items-center gap-2">
                        <Icon name="Star" size={24} className="text-magic" />
                        Choose a Feat
                    </h2>
                    <div className="space-y-3">
                        {featChoices.map((featId) => {
                            const feat = MOCK_FEATS[featId];
                            const isSelected = selectedFeatId === featId;

                            return (
                                <button
                                    key={featId}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                        isSelected
                                            ? 'border-magic bg-magic/20 shadow-lg shadow-magic/20 scale-[1.02]'
                                            : 'border-border-default hover:border-magic/50 hover:bg-secondary/50'
                                    }`}
                                    onClick={() => setSelectedFeatId(featId)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            isSelected ? 'bg-magic/30 border border-magic' : 'bg-secondary border border-border-default'
                                        }`}>
                                            <Icon name="Zap" size={20} className={isSelected ? 'text-magic' : 'text-fg-muted'} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="feat-name text-fg-accent mb-1 flex items-center gap-2">
                                                {feat.name}
                                                {isSelected && <Icon name="Check" size={16} className="text-magic" />}
                                            </h3>
                                            <p className="body-secondary text-sm text-fg-muted">{feat.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    className={`button-text w-full py-4 rounded-lg text-lg font-bold transition-all flex items-center justify-center gap-3 ${
                        selectedFeatId
                            ? 'bg-gradient-to-br from-success to-success/80 text-white hover:from-success/90 hover:to-success/70 shadow-lg shadow-success/20 active:scale-[0.98]'
                            : 'bg-secondary border-2 border-border-default text-fg-muted cursor-not-allowed opacity-50'
                    }`}
                    onClick={handleConfirm}
                    disabled={!selectedFeatId}
                >
                    {selectedFeatId ? (
                        <>
                            <Icon name="Check" size={24} />
                            <span>Confirm Level Up</span>
                        </>
                    ) : (
                        <>
                            <Icon name="Star" size={24} />
                            <span>Select a Feat</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}