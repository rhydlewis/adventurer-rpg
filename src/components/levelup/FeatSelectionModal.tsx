import { useLevelUpStore } from '../../stores/levelUpStore';
import { Button, Card, Icon } from '../index';

interface FeatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeatSelectionModal({ isOpen, onClose }: FeatSelectionModalProps) {
  const { availableFeats, selectedFeat, selectFeat } = useLevelUpStore();

  if (!isOpen) return null;

  const handleSelectFeat = (featId: string) => {
    selectFeat(featId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card variant="neutral" padding="spacious">
          {/* Modal Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-magic/10 p-3 rounded-lg">
              <Icon name="Star" size={32} className="text-magic" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wide text-fg-muted">Level Up</span>
              </div>
              <h2 className="heading-display text-fg-accent">Choose a Feat</h2>
            </div>
            <button
              onClick={onClose}
              className="text-fg-muted hover:text-fg-primary transition-colors"
              aria-label="Close"
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="body-primary text-fg-muted">
              Select a feat to enhance your character's abilities. Each feat provides unique bonuses and
              capabilities.
            </p>
          </div>

          {/* Feat List */}
          {availableFeats.length === 0 ? (
            <div className="text-center py-8 text-fg-muted">
              <Icon name="Loader" size={48} className="mx-auto mb-3 animate-spin" />
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
                        ? 'border-magic bg-magic/20 shadow-lg shadow-magic/20'
                        : 'border-border-default hover:border-magic/50 hover:bg-secondary/50'
                    }`}
                    onClick={() => handleSelectFeat(feat.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-magic/30 border border-magic'
                            : 'bg-secondary border border-border-default'
                        }`}
                      >
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
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button onClick={onClose} variant="secondary" fullWidth>
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
