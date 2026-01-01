import { useEffect, useState } from 'react';
import { useLevelUpStore } from '../stores/levelUpStore';
import { useNarrativeStore } from '../stores/narrativeStore';
import { completeLevelUp } from '../utils/levelUpTrigger';
import { Icon } from '../components';
import { FeatSelectionModal } from '../components/levelup/FeatSelectionModal';
import { SkillAllocationModal } from '../components/levelup/SkillAllocationModal';
import { SpellSelectionModal } from '../components/levelup/SpellSelectionModal';

export function LevelUpScreen() {
    const onNavigate = useNarrativeStore((state) => state.onNavigate);
    const {
        pendingLevelUp,
        levelUpInProgress,
        availableFeats,
        selectedFeat,
        skillPointsToAllocate,
        spellsToSelect,
        selectedSpells,
        loadAvailableFeats,
        loadAvailableSpells,
    } = useLevelUpStore();

    const [showFeatModal, setShowFeatModal] = useState(false);
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [showSpellModal, setShowSpellModal] = useState(false);

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

    // Load available spells if spells need to be selected
    useEffect(() => {
        if (spellsToSelect > 0) {
            loadAvailableSpells();
        }
    }, [spellsToSelect, loadAvailableSpells]);

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

        if (spellsToSelect > 0 && selectedSpells.length < spellsToSelect) {
            return; // Spells not selected
        }

        // Complete the level-up and navigate back
        completeLevelUp();
        onNavigate?.({ type: 'story' });
    };

    const canComplete =
        (!pendingLevelUp.featGained || selectedFeat !== null) &&
        skillPointsToAllocate === 0 &&
        (spellsToSelect === 0 || selectedSpells.length === spellsToSelect);

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
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="heading-secondary flex items-center gap-2">
                                <Icon name="Star" size={24} className="text-magic" />
                                Feat Selection
                            </h2>
                            {selectedFeat && (
                                <div className="flex items-center gap-2 text-sm text-success">
                                    <Icon name="Check" size={16} />
                                    <span>Selected</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFeatModal(true)}
                            className="w-full p-4 rounded-lg border-2 border-border-default hover:border-magic/50 hover:bg-secondary/50 transition-all text-left"
                        >
                            <div className="flex items-center justify-between">
                                <span className="body-primary text-fg-primary">
                                    {selectedFeat
                                        ? availableFeats.find((f) => f.id === selectedFeat)?.name || 'Select a Feat'
                                        : 'Choose a feat to enhance your abilities'}
                                </span>
                                <Icon name="ChevronRight" size={20} className="text-fg-muted" />
                            </div>
                        </button>
                    </div>
                )}

                {/* Skill Points Section */}
                {pendingLevelUp.skillPoints > 0 && (
                    <div className="bg-gradient-to-br from-secondary to-secondary/50 p-6 rounded-xl border-2 border-warning/30 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="heading-secondary flex items-center gap-2">
                                <Icon name="BookOpen" size={24} className="text-warning" />
                                Skill Points
                            </h2>
                            {skillPointsToAllocate === 0 && (
                                <div className="flex items-center gap-2 text-sm text-success">
                                    <Icon name="Check" size={16} />
                                    <span>Allocated</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowSkillModal(true)}
                            className="w-full p-4 rounded-lg border-2 border-border-default hover:border-warning/50 hover:bg-secondary/50 transition-all text-left"
                        >
                            <div className="flex items-center justify-between">
                                <span className="body-primary text-fg-primary">
                                    {skillPointsToAllocate === 0
                                        ? `All ${pendingLevelUp.skillPoints} points allocated`
                                        : `Allocate ${skillPointsToAllocate} skill point${skillPointsToAllocate > 1 ? 's' : ''}`}
                                </span>
                                <Icon name="ChevronRight" size={20} className="text-fg-muted" />
                            </div>
                        </button>
                    </div>
                )}

                {/* Spell Selection Section */}
                {spellsToSelect > 0 && (
                    <div className="bg-gradient-to-br from-secondary to-secondary/50 p-6 rounded-xl border-2 border-magic/30 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="heading-secondary flex items-center gap-2">
                                <Icon name="Sparkles" size={24} className="text-magic" />
                                Spell Selection
                            </h2>
                            {selectedSpells.length === spellsToSelect && (
                                <div className="flex items-center gap-2 text-sm text-success">
                                    <Icon name="Check" size={16} />
                                    <span>Selected</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowSpellModal(true)}
                            className="w-full p-4 rounded-lg border-2 border-border-default hover:border-magic/50 hover:bg-secondary/50 transition-all text-left"
                        >
                            <div className="flex items-center justify-between">
                                <span className="body-primary text-fg-primary">
                                    {selectedSpells.length === spellsToSelect
                                        ? `Selected ${selectedSpells.length} spell${selectedSpells.length > 1 ? 's' : ''}`
                                        : `Learn ${spellsToSelect - selectedSpells.length} more spell${spellsToSelect - selectedSpells.length > 1 ? 's' : ''}`}
                                </span>
                                <Icon name="ChevronRight" size={20} className="text-fg-muted" />
                            </div>
                        </button>
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
                                      : spellsToSelect > 0 && selectedSpells.length < spellsToSelect
                                        ? 'Select Spells'
                                        : 'Complete Requirements'}
                            </span>
                        </>
                    )}
                </button>
            </div>

            {/* Modals */}
            <FeatSelectionModal isOpen={showFeatModal} onClose={() => setShowFeatModal(false)} />
            <SkillAllocationModal isOpen={showSkillModal} onClose={() => setShowSkillModal(false)} />
            <SpellSelectionModal isOpen={showSpellModal} onClose={() => setShowSpellModal(false)} />
        </div>
    );
}