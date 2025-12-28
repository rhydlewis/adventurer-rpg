import { useState } from 'react';
import { CLASSES } from '../data/classes';
import { getBackgroundByClass } from '../data/backgrounds';
import { getQuirkInfo } from '../data/quirkInfo';
import type { CharacterClass } from '../types';
import { Button, Card, Icon } from '../components';

interface QuickCharacterCreationScreenProps {
  onComplete: (characterClass: CharacterClass) => void;
}

const classIcons = {
  Fighter: 'Swords' as const,
  Rogue: 'Eye' as const,
  Wizard: 'Sparkles' as const,
  Cleric: 'Heart' as const,
};

const classDescriptions = {
  Fighter: 'Master of weapons & armor. High hit points, solid damage output and a knack for turning the tide in melee.',
  Rogue: 'Rapid, clever and always looking for the perfect opening. Deals bonus damage when catching enemies unaware.',
  Wizard: 'Spell‑studying prodigy who commands powerful, reality‑bending magic. Relies on preparation and cunning.',
  Cleric: 'Channels sacred power to heal and vanquish the unholy. Steadfast defender whose prayers can turn the tide of battle.',
};

export function QuickCharacterCreationScreen({ onComplete }: QuickCharacterCreationScreenProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClassSelect = (className: CharacterClass) => {
    setSelectedClass(className);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!selectedClass) return;
    onComplete(selectedClass);
  };

  const handleBack = () => {
    setShowConfirm(false);
    setSelectedClass(null);
  };

  if (showConfirm && selectedClass) {
    const background = getBackgroundByClass(selectedClass);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-fg-primary p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="heading-display text-fg-accent mb-4 text-center">
            Confirm Your Choice
          </h1>

          <Card variant="neutral" padding="spacious" className="mb-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 border-2 border-accent mb-4">
                <Icon name={classIcons[selectedClass]} size={40} className="text-accent" />
              </div>
              <h2 className="heading-primary mb-2">{selectedClass}</h2>
              <p className="body-secondary mb-4">{classDescriptions[selectedClass]}</p>
            </div>

            <div className="border-t border-border-default pt-4">
              <h3 className="heading-secondary mb-3">Background</h3>
              <p className="body-secondary mb-4">
                <div className="font-bold">{background.name}</div>
                <div className="italic">{background.description}</div>
              </p>

              <div className="space-y-2">
                {background.startingQuirk && (
                  <div className="flex items-start gap-2">
                    <Icon name="Zap" size={16} className="text-fg-accent flex-shrink-0" />
                    <div className="flex-1">
                      <span className="body-primary text-sm font-semibold text-fg-accent">
                        {getQuirkInfo(background.startingQuirk).displayName}
                      </span>
                      <p className="body-secondary text-xs mt-1">
                        {getQuirkInfo(background.startingQuirk).description}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Icon name="Book" size={16} className="text-fg-accent flex-shrink-0" />
                  <span className="body-primary text-sm">
                    Tagged Skills: {background.taggedSkills?.join(', ') || 'None'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/50 rounded">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-fg-accent flex-shrink-0 mt-0.5" />
                <p className="body-secondary text-sm">
                  Your character will use recommended stats based on your background.
                  You can customize later in the campaign.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="secondary" onClick={handleBack} fullWidth>
              Back
            </Button>
            <Button variant="primary" onClick={handleConfirm} fullWidth>
              Begin Adventure
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-fg-primary p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="heading-display text-fg-accent mb-4 text-center">
          Choose Your Path
        </h1>
        <p className="body-secondary text-center mb-8">
          Select your character class
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(CLASSES) as CharacterClass[]).map((className) => {
            const background = getBackgroundByClass(className);

            return (
              <button
                key={className}
                onClick={() => handleClassSelect(className)}
                className="text-left p-4 rounded-lg border-2 border-border-default hover:border-accent bg-secondary hover:bg-secondary/80 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={classIcons[className]} size={24} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h2 className="heading-secondary mb-2">{className}</h2>
                    <p className="text-xs mb-2">{classDescriptions[className]}</p>
                    <div className="text-xs text-fg-muted">
                      <p>Background: <span className="text-fg-accent">{background.name}</span></p>
                      <p>Quirk: {background.startingQuirk ? getQuirkInfo(background.startingQuirk).displayName : 'None'}</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
