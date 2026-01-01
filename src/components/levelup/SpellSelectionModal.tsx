import { useLevelUpStore } from '../../stores/levelUpStore';
import { Button, Card, Icon } from '../index';

interface SpellSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpellSelectionModal({ isOpen, onClose }: SpellSelectionModalProps) {
  const { availableSpells, selectedSpells, spellsToSelect, selectSpell, deselectSpell } = useLevelUpStore();

  if (!isOpen) return null;

  const spellsRemaining = spellsToSelect - selectedSpells.length;
  const canSelectMore = spellsRemaining > 0;
  const allSelected = selectedSpells.length === spellsToSelect;

  const handleToggleSpell = (spellId: string) => {
    if (selectedSpells.includes(spellId)) {
      deselectSpell(spellId);
    } else if (canSelectMore) {
      selectSpell(spellId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card variant="neutral" padding="spacious">
          {/* Modal Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-magic/10 p-3 rounded-lg">
              <Icon name="Sparkles" size={32} className="text-magic" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wide text-fg-muted">Level Up</span>
              </div>
              <h2 className="heading-display text-fg-accent">Learn New Spells</h2>
              <p className="body-secondary text-sm text-fg-muted mt-1">
                {spellsRemaining} {spellsRemaining === 1 ? 'spell' : 'spells'} remaining
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-fg-muted hover:text-fg-primary transition-colors"
              aria-label="Close"
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          {/* Spell Selection Summary */}
          <div className="mb-6 p-4 bg-primary/30 rounded-lg border border-border-default">
            <div className="flex justify-between items-center">
              <span className="body-primary text-fg-primary">Spells Selected</span>
              <div className="flex items-center gap-2">
                <span className="stat-medium text-fg-accent">
                  {selectedSpells.length} / {spellsToSelect}
                </span>
                {allSelected && <Icon name="Check" size={20} className="text-success" />}
              </div>
            </div>
          </div>

          {/* Available Spells */}
          {availableSpells.length === 0 ? (
            <div className="text-center py-8 text-fg-muted">
              <Icon name="Loader" size={48} className="mx-auto mb-3 animate-spin" />
              <p className="body-secondary">Loading available spells...</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {availableSpells.map((spell) => {
                const isSelected = selectedSpells.includes(spell.id);
                const canSelect = canSelectMore || isSelected;

                return (
                  <button
                    key={spell.id}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-magic bg-magic/20 shadow-lg shadow-magic/20'
                        : canSelect
                          ? 'border-border-default hover:border-magic/50 hover:bg-secondary/50'
                          : 'border-border-default bg-secondary/20 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => handleToggleSpell(spell.id)}
                    disabled={!canSelect}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-magic/30 border border-magic'
                            : 'bg-secondary border border-border-default'
                        }`}
                      >
                        <Icon name="Wand" size={20} className={isSelected ? 'text-magic' : 'text-fg-muted'} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="feat-name text-fg-accent flex items-center gap-2">
                            {spell.name}
                            {isSelected && <Icon name="Check" size={16} className="text-magic" />}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-primary border border-border-default text-fg-muted">
                              Level {spell.level}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-primary border border-border-default text-fg-muted capitalize">
                              {spell.school}
                            </span>
                          </div>
                        </div>
                        <p className="body-secondary text-sm text-fg-muted">{spell.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="secondary" fullWidth>
              Cancel
            </Button>
            <Button onClick={onClose} variant="primary" fullWidth disabled={!allSelected}>
              {allSelected ? 'Confirm' : 'Select All Spells'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
