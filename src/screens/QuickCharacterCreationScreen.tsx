import { useState } from 'react';
import { CLASSES } from '../data/classes';
import { getBackgroundByClass } from '../data/backgrounds';
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
  Fighter: 'Master of weapons and armor. High HP and strong in melee combat.',
  Rogue: 'Sneaky and skillful. Deals extra damage with sneak attacks.',
  Wizard: 'Arcane spellcaster. Wields powerful magic but fragile in combat.',
  Cleric: 'Divine spellcaster. Heals allies and smites enemies with holy power.',
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
              <h3 className="heading-secondary mb-3">Background: {background.name}</h3>
              <p className="body-secondary mb-4 italic">"{background.description}"</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="Zap" size={16} className="text-fg-accent flex-shrink-0" />
                  <span className="body-primary text-sm">
                    Starting Quirk: <span className="text-fg-accent">{background.startingQuirk}</span>
                  </span>
                </div>
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
                  <strong>Phase 1:</strong> Your character will use recommended stats based on your background.
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
          Select your character class to begin your adventure
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(CLASSES) as CharacterClass[]).map((className) => {
            const background = getBackgroundByClass(className);

            return (
              <button
                key={className}
                onClick={() => handleClassSelect(className)}
                className="text-left p-6 rounded-lg border-2 border-border-default hover:border-accent bg-secondary hover:bg-secondary/80 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={classIcons[className]} size={24} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h2 className="heading-secondary mb-2">{className}</h2>
                    <p className="body-secondary text-sm mb-3">{classDescriptions[className]}</p>
                    <div className="text-xs text-fg-muted">
                      <p>Background: <span className="text-fg-accent">{background.name}</span></p>
                      <p>Quirk: {background.startingQuirk}</p>
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
