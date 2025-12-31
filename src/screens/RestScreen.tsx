import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { useRestStore } from '../stores/restStore';
import { useSafeHavenStore } from '../stores/safeHavenStore';
import { useCampEventStore } from '../stores/campEventStore';
import { useNarrativeStore } from '../stores/narrativeStore';
import { BackButton, Button, Card, Icon } from '../components';
import type { RestType } from '../types/rest';
import type { RecoveryResult } from '../utils/restLogic';

interface RestScreenProps {
  onClose: () => void;
  onOpenMerchant?: () => void;
}

export function RestScreen({ onClose, onOpenMerchant }: RestScreenProps) {
  const character = useCharacterStore(state => state.character);
  const currentNodeId = useNarrativeStore(state => state.world?.currentNodeId);
  const isSafeHaven = useSafeHavenStore(state =>
    currentNodeId ? state.isSafeHaven(currentNodeId) : false
  );
  const safeHaven = useSafeHavenStore(state =>
    currentNodeId ? state.getSafeHaven(currentNodeId) : null
  );

  const [showRecovery, setShowRecovery] = useState(false);
  const [recovery, setRecovery] = useState<RecoveryResult | null>(null);

  const handleRest = (restType: RestType) => {
    const result = useRestStore.getState().initiateRest(restType);
    if (!result) return;

    // Check for camp events if long rest and not safe haven
    if (restType === 'long' && !isSafeHaven && currentNodeId) {
      const event = useCampEventStore.getState().triggerCampEvent(currentNodeId);

      if (event) {
        // TODO: Show camp event modal
        // For now, just complete the rest
        useRestStore.getState().completeRest(result);
        setRecovery(result);
        setShowRecovery(true);
        return;
      }
    }

    // No event, complete rest
    useRestStore.getState().completeRest(result);
    setRecovery(result);
    setShowRecovery(true);
  };

  if (!character) {
    return (
      <div className="min-h-screen bg-primary text-fg-primary p-4 flex items-center justify-center">
        <Card variant="neutral" padding="spacious">
          <div className="text-center space-y-4">
            <Icon name="Info" size={64} className="mx-auto text-fg-muted" />
            <h1 className="heading-primary text-fg-accent">No Character</h1>
            <p className="body-primary text-fg-secondary">
              You need a character to rest.
            </p>
            <Button onClick={onClose} variant="primary" fullWidth>
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const hpPercent = (character.hp / character.maxHp) * 100;
  const isLowHp = hpPercent < 50;
  const isCriticalHp = hpPercent < 25;

  return (
    <div className="min-h-screen bg-primary text-fg-primary p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton onBack={onClose} />
          <div className="flex items-center gap-3">
            <Icon name="Tent" size={32} className="text-success" />
            <h1 className="heading-display text-fg-accent">Rest</h1>
          </div>
        </div>

        {/* Current Status Card */}
        <Card variant="neutral" padding="default">
          <div className="space-y-3">
            <h2 className="heading-secondary text-fg-primary">Current Status</h2>

            {/* HP Bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="body-secondary text-fg-secondary">Hit Points</span>
                <span className={`stat-medium ${isCriticalHp ? 'text-enemy' : isLowHp ? 'text-warning' : 'text-success'}`}>
                  {character.hp} / {character.maxHp}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isCriticalHp ? 'bg-enemy' : isLowHp ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {isSafeHaven && safeHaven && (
              <div className="flex items-center gap-2 text-success">
                <Icon name="Shield" size={16} />
                <span className="body-secondary">{safeHaven.name} - Safe Haven</span>
              </div>
            )}
          </div>
        </Card>

        {/* Recovery Result */}
        {showRecovery && recovery && (
          <Card variant="neutral" padding="default">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Sparkles" size={20} className="text-success" />
                <h2 className="heading-secondary text-fg-primary">Recovery Complete</h2>
              </div>
              <div className="body-primary text-fg-secondary">
                <p>HP restored: <span className="text-success font-semibold">+{recovery.hpRestored}</span></p>
                {recovery.abilitiesRestored && (
                  <p className="text-fg-accent">All abilities restored!</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Rest Options */}
        <div className="space-y-3">
          <h2 className="heading-secondary text-fg-primary">Rest Options</h2>

          {/* Short Rest */}
          <button onClick={() => handleRest('short')} className="w-full text-left">
            <Card
              variant="neutral"
              padding="default"
              className="cursor-pointer hover:border-success transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="bg-success/20 p-3 rounded-lg">
                  <Icon name="Coffee" size={24} className="text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="heading-tertiary text-fg-accent mb-1">Short Rest</h3>
                  <p className="body-secondary text-fg-secondary text-sm mb-2">
                    Restore 50% HP (instant, safe)
                  </p>
                  <div className="flex items-center gap-2 text-success">
                    <Icon name="Shield" size={14} />
                    <span className="text-xs">No random encounters</span>
                  </div>
                </div>
              </div>
            </Card>
          </button>

          {/* Long Rest */}
          <button onClick={() => handleRest('long')} className="w-full text-left">
            <Card
              variant="neutral"
              padding="default"
              className={`cursor-pointer transition-colors ${
                isSafeHaven ? 'hover:border-success' : 'hover:border-warning'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`${isSafeHaven ? 'bg-success/20' : 'bg-warning/20'} p-3 rounded-lg`}>
                  <Icon name="Moon" size={24} className={isSafeHaven ? 'text-success' : 'text-warning'} />
                </div>
                <div className="flex-1">
                  <h3 className="heading-tertiary text-fg-accent mb-1">Long Rest</h3>
                  <p className="body-secondary text-fg-secondary text-sm mb-2">
                    Restore 100% HP and all abilities
                  </p>
                  {!isSafeHaven && (
                    <div className="flex items-center gap-2 text-warning">
                      <Icon name="TriangleAlert" size={14} />
                      <span className="text-xs">Camp events possible</span>
                    </div>
                  )}
                  {isSafeHaven && (
                    <div className="flex items-center gap-2 text-success">
                      <Icon name="Shield" size={14} />
                      <span className="text-xs">Guaranteed safety</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </button>

          {/* Safe Haven - Visit Merchant */}
          {isSafeHaven && safeHaven?.merchantAvailable && onOpenMerchant && (
            <button onClick={onOpenMerchant} className="w-full text-left">
              <Card
                variant="neutral"
                padding="default"
                className="cursor-pointer hover:border-fg-accent transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-warning/20 p-3 rounded-lg">
                    <Icon name="ShoppingBag" size={24} className="text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="heading-tertiary text-fg-accent mb-1">Visit Merchant</h3>
                    <p className="body-secondary text-fg-secondary text-sm">
                      Buy and sell items
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          )}
        </div>

        {/* Continue Button */}
        <Button onClick={onClose} variant="secondary" fullWidth>
          <Icon name="ArrowLeft" size={16} />
          <span>Continue Adventure</span>
        </Button>
      </div>
    </div>
  );
}
