import {useState, useEffect} from 'react';
import {useCharacterStore} from '../stores/characterStore';
import {useNarrativeStore} from '../stores/narrativeStore';
import {getExplorationTable} from '../data/explorationTables';
import {rollExplorationTable} from '../utils/exploration';
import {getItem} from '../data/items';
import {Button} from '../components';
import type {ExplorationOutcome} from '../types';
import type {Screen} from '../types';

interface ExplorationScreenProps {
    tableId: string;
    onceOnly: boolean;
    onComplete: () => void;
    onNavigate?: (screen: Screen) => void;
}

export function ExplorationScreen({tableId, onComplete, onNavigate}: ExplorationScreenProps) {
    const {character, setCharacter} = useCharacterStore();
    const world = useNarrativeStore((state) => state.world);
    const [outcome, setOutcome] = useState<ExplorationOutcome | null>(null);
    const [isRolling, setIsRolling] = useState(true);

    useEffect(() => {
        // Roll on exploration table after short delay (for suspense)
        const timer = setTimeout(() => {
            const table = getExplorationTable(tableId);
            const result = rollExplorationTable(table);
            setOutcome(result);
            setIsRolling(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [tableId]);

    if (!character || !world) {
        return <div className="body-primary">Loading...</div>;
    }

    if (isRolling) {
        return (
            <div className="min-h-screen bg-primary text-fg-primary flex items-center justify-center">
                <div className="text-center">
                    <h1 className="heading-display text-text-accent mb-4">Exploring...</h1>
                    <p className="body-primary animate-pulse">You search the area carefully...</p>
                </div>
            </div>
        );
    }

    if (!outcome) {
        return <div className="body-primary">Error: No outcome</div>;
    }

    const handleContinue = () => {
        // Apply treasure rewards
        if (outcome.type === 'treasure') {
            const updatedCharacter = {
                ...character,
                gold: (character.gold || 0) + outcome.gold,
                inventory: [
                    ...(character.inventory || []),
                    ...outcome.items.map((itemId) => getItem(itemId)),
                ],
            };
            setCharacter(updatedCharacter);
            onComplete();
            return;
        }

        // Combat outcome - navigate to combat screen
        if (outcome.type === 'combat') {
            if (onNavigate) {
                onNavigate({
                    type: 'combat',
                    enemyId: outcome.enemyId,
                    onVictoryNodeId: 'exploration-combat-victory', // Temporary, will return to story
                });
            } else {
                console.error('ExplorationScreen: onNavigate not provided, cannot start combat');
                onComplete();
            }
            return;
        }

        // Vignette and nothing outcomes - just complete
        onComplete();
    };

    return (
        <div className="min-h-screen bg-primary text-fg-primary p-6">
            <div className="max-w-2xl mx-auto">
                {/* Combat Outcome */}
                {outcome.type === 'combat' && (
                    <>
                        <h1 className="heading-display text-error mb-4">Encounter!</h1>
                        <p className="body-primary mb-6">
                            You've encountered a dangerous foe! Prepare for battle.
                        </p>
                        <div className="bg-secondary p-4 rounded border border-border mb-6">
                            <p className="body-secondary">
                                Enemy: <span className="text-text-accent">{outcome.enemyId}</span>
                            </p>
                            <p className="body-secondary">
                                Reward: <span className="text-gold">{outcome.goldReward} gold</span>
                                {outcome.itemReward && ` + ${getItem(outcome.itemReward).name}`}
                            </p>
                        </div>
                    </>
                )}

                {/* Treasure Outcome */}
                {outcome.type === 'treasure' && (
                    <>
                        <h1 className="heading-display text-gold mb-4">Treasure Found!</h1>
                        <p className="body-primary mb-6">
                            You discover a hidden cache of valuables!
                        </p>
                        <div className="bg-secondary p-4 rounded border border-border mb-6 space-y-2">
                            <p className="stat-medium text-gold">+{outcome.gold} gold</p>
                            {outcome.items.map((itemId) => {
                                const item = getItem(itemId);
                                return (
                                    <p key={itemId} className="body-secondary">
                                        • {item.name}
                                    </p>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Vignette Outcome */}
                {outcome.type === 'vignette' && (
                    <>
                        <h1 className="heading-display text-text-accent mb-4">Discovery</h1>
                        <p className="body-narrative mb-6">{outcome.description}</p>
                    </>
                )}

                {/* Nothing Outcome */}
                {outcome.type === 'nothing' && (
                    <>
                        <h1 className="heading-display text-text-muted mb-4">Nothing Found</h1>
                        <p className="body-secondary mb-6">{outcome.message}</p>
                    </>
                )}

                {/* Continue Button */}
                <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={handleContinue}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
