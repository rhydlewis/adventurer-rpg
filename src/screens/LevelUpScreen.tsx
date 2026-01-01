import { useEffect } from 'react';
import { useLevelUpStore } from '../stores/levelUpStore';
import { useNarrativeStore } from '../stores/narrativeStore';
import { completeLevelUp } from '../utils/levelUpTrigger';
import { Icon } from '../components';

export function LevelUpScreen() {
    const onNavigate = useNarrativeStore((state) => state.onNavigate);
    const {
        pendingLevelUp,
        levelUpInProgress,
        availableFeats,
        selectedFeat,
        skillPointsToAllocate,
        loadAvailableFeats,
        selectFeat,
    } = useLevelUpStore();

    // Redirect if no level-up in progress
    useEffect(() => {
        if (!levelUpInProgress || !pendingLevelUp) {
            onNavigate?.({ type: 'story' });
        }
    }, [levelUpInProgress, pendingLevelUp, onNavigate]);

    // Load available feats if feat is gained
    useEffect(() => {
        if (pendingLevelUp?.featGained && availableFeats.length === 0) {
            loadAvailableFeats();
        }
    }, [pendingLevelUp, availableFeats.length, loadAvailableFeats]);

    if (!pendingLevelUp || !levelUpInProgress) {
        return null;
    }

    const handleConfirm = () => {
        // Check if all required selections are made
        if (pendingLevelUp.featGained && !selectedFeat) {
            return; // Feat selection required
        }

        if (skillPointsToAllocate > 0) {
            return; // Skill points not allocated
        }

        // Complete the level-up and navigate back
        completeLevelUp();
        onNavigate?.({ type: 'story' });
    };

    const canComplete =
        (!pendingLevelUp.featGained || selectedFeat !== null) &&
        skillPointsToAllocate === 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-fg-primary p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/20 border-2 border-warning mb-4">
                        <Icon name="Trophy" size={40} className="text-warning" />
                    </div>
                    <h1 className="heading-display text-fg-accent mb-2">
                        Level {pendingLevelUp.newLevel}!
                    </h1>
                    <p className="heading-primary text-fg-muted">
                        You've advanced from level {pendingLevelUp.oldLevel} to {pendingLevelUp.newLevel}
                    </p>
                </div>

                {/* Stat Increases */}
                <div className="bg-gradient-to-br from-secondary to-secondary/50 p-6 rounded-xl border-2 border-success/30 mb-6">
                    <h2 className="heading-secondary mb-4 flex items-center gap-2">
                        <Icon name="TrendingUp" size={24} className="text-success" />
                        Stat Increases
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center body-primary p-3 bg-primary/30 rounded-lg">
                            <span className="flex items-center gap-2">
                                <Icon name="Heart" size={18} className="text-success" />
                                Hit Points:
                            </span>
                            <span className="stat-medium text-success font-bold">
                                +{pendingLevelUp.hpGained} HP
                            </span>
                        </div>
                        {pendingLevelUp.babGained > 0 && (
                            <div className="flex justify-between items-center body-primary p-3 bg-primary/30 rounded-lg">
                                <span className="flex items-center gap-2">
                                    <Icon name="Swords" size={18} className="text-warning" />
                                    Base Attack Bonus:
                                </span>
                                <span className="stat-medium text-warning font-bold">
                                    +{pendingLevelUp.babGained}
                                </span>
                            </div>
                        )}
                        {(pendingLevelUp.savesGained.fort > 0 ||
                            pendingLevelUp.savesGained.reflex > 0 ||
                            pendingLevelUp.savesGained.will > 0) && (
                            <div className="body-primary p-3 bg-primary/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name="Shield" size={18} className="text-magic" />
                                    <span>Saving Throws:</span>
                                </div>
                                <div className="ml-6 space-y-1 text-sm">
                                    {pendingLevelUp.savesGained.fort > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-fg-muted">Fortitude:</span>
                                            <span className="text-magic font-bold">
                                                +{pendingLevelUp.savesGained.fort}
                                            </span>
                                        </div>
                                    )}
                                    {pendingLevelUp.savesGained.reflex > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-fg-muted">Reflex:</span>
                                            <span className="text-magic font-bold">
                                                +{pendingLevelUp.savesGained.reflex}
                                            </span>
                                        </div>
                                    )}
                                    {pendingLevelUp.savesGained.will > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-fg-muted">Will:</span>
                                            <span className="text-magic font-bold">
                                                +{pendingLevelUp.savesGained.will}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {pendingLevelUp.skillPoints > 0 && (
                            <div className="flex justify-between items-center body-primary p-3 bg-primary/30 rounded-lg">
                                <span className="flex items-center gap-2">
                                    <Icon name="BookOpen" size={18} className="text-success" />
                                    Skill Points:
                                </span>
                                <span className="stat-medium text-success font-bold">
                                    {pendingLevelUp.skillPoints}
                                </span>
                            </div>
                        )}
                        {pendingLevelUp.classFeatures.length > 0 && (
                            <div className="body-primary p-3 bg-primary/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name="Star" size={18} className="text-warning" />
                                    <span>Class Features:</span>
                                </div>
                                <div className="ml-6 space-y-1 text-sm">
                                    {pendingLevelUp.classFeatures.map((feature) => (
                                        <div key={feature} className="text-fg-muted">
                                            • {feature.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Feat Selection */}
                {pendingLevelUp.featGained && (
                    <div className="bg-gradient-to-br from-secondary to-secondary/50 p-6 rounded-xl border-2 border-magic/30 mb-6">
                        <h2 className="heading-secondary mb-4 flex items-center gap-2">
                            <Icon name="Star" size={24} className="text-magic" />
                            Choose a Feat
                        </h2>
                        {availableFeats.length === 0 ? (
                            <div className="text-center py-4 text-fg-muted">
                                <Icon name="Loader" size={24} className="animate-spin mx-auto mb-2" />
                                <p className="body-secondary">Loading available feats...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableFeats.map((feat) => {
                                    const isSelected = selectedFeat === feat.id;

                                    return (
                                        <button
                                            key={feat.id}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                isSelected
                                                    ? 'border-magic bg-magic/20 shadow-lg shadow-magic/20 scale-[1.02]'
                                                    : 'border-border-default hover:border-magic/50 hover:bg-secondary/50'
                                            }`}
                                            onClick={() => selectFeat(feat.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                        isSelected
                                                            ? 'bg-magic/30 border border-magic'
                                                            : 'bg-secondary border border-border-default'
                                                    }`}
                                                >
                                                    <Icon
                                                        name="Zap"
                                                        size={20}
                                                        className={isSelected ? 'text-magic' : 'text-fg-muted'}
                                                    />
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
                        )}
                    </div>
                )}

                {/* Skill Points Section - TODO: Add SkillAllocationModal */}
                {pendingLevelUp.skillPoints > 0 && skillPointsToAllocate > 0 && (
                    <div className="bg-gradient-to-br from-secondary to-secondary/50 p-6 rounded-xl border-2 border-warning/30 mb-6">
                        <h2 className="heading-secondary mb-4 flex items-center gap-2">
                            <Icon name="BookOpen" size={24} className="text-warning" />
                            Allocate Skill Points
                        </h2>
                        <div className="text-center py-4">
                            <p className="body-primary text-fg-muted mb-2">
                                You have {skillPointsToAllocate} skill point{skillPointsToAllocate > 1 ? 's' : ''} to
                                allocate
                            </p>
                            <p className="body-secondary text-sm text-fg-muted">
                                Skill allocation modal coming soon
                            </p>
                        </div>
                    </div>
                )}

                {/* Confirm Button */}
                <button
                    className={`button-text w-full py-4 rounded-lg text-lg font-bold transition-all flex items-center justify-center gap-3 ${
                        canComplete
                            ? 'bg-gradient-to-br from-success to-success/80 text-white hover:from-success/90 hover:to-success/70 shadow-lg shadow-success/20 active:scale-[0.98]'
                            : 'bg-secondary border-2 border-border-default text-fg-muted cursor-not-allowed opacity-50'
                    }`}
                    onClick={handleConfirm}
                    disabled={!canComplete}
                >
                    {canComplete ? (
                        <>
                            <Icon name="Check" size={24} />
                            <span>Complete Level Up</span>
                        </>
                    ) : (
                        <>
                            <Icon name="Info" size={24} />
                            <span>
                                {pendingLevelUp.featGained && !selectedFeat
                                    ? 'Select a Feat'
                                    : skillPointsToAllocate > 0
                                      ? 'Allocate Skill Points'
                                      : 'Complete Requirements'}
                            </span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}