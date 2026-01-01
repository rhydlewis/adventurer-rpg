import { useLevelUpStore } from '../../stores/levelUpStore';
import { useCharacterStore } from '../../stores/characterStore';
import { Button, Card, Icon } from '../index';
import type { SkillName } from '../../types/skill';
import type { icons } from 'lucide-react';

interface SkillAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SKILL_DESCRIPTIONS: Record<SkillName, { icon: keyof typeof icons; description: string }> = {
  Athletics: {
    icon: 'User',
    description: 'Physical prowess, climbing, jumping, swimming',
  },
  Stealth: {
    icon: 'EyeOff',
    description: 'Moving silently, hiding, avoiding detection',
  },
  Perception: {
    icon: 'Eye',
    description: 'Spotting details, sensing danger, searching',
  },
  Arcana: {
    icon: 'Sparkles',
    description: 'Knowledge of magic, spells, and magical creatures',
  },
  Medicine: {
    icon: 'Heart',
    description: 'Healing wounds, diagnosing illness, first aid',
  },
  Intimidate: {
    icon: 'Flame',
    description: 'Forcing compliance through threats or fear',
  },
};

export function SkillAllocationModal({ isOpen, onClose }: SkillAllocationModalProps) {
  const character = useCharacterStore((state) => state.character);
  const { skillPointsToAllocate, allocatedSkillPoints, allocateSkillPoint, deallocateSkillPoint } =
    useLevelUpStore();

  if (!isOpen || !character) return null;

  const skills = Object.keys(character.skills) as SkillName[];

  const getTotalAllocated = (): number => {
    return Object.values(allocatedSkillPoints).reduce((sum, points) => sum + (points || 0), 0);
  };

  const pointsRemaining = skillPointsToAllocate - getTotalAllocated();
  const canAllocate = pointsRemaining > 0;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card variant="neutral" padding="spacious">
          {/* Modal Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-warning/10 p-3 rounded-lg">
              <Icon name="BookOpen" size={32} className="text-warning" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wide text-fg-muted">Level Up</span>
              </div>
              <h2 className="heading-display text-fg-accent">Allocate Skill Points</h2>
              <p className="body-secondary text-sm text-fg-muted mt-1">
                {pointsRemaining} {pointsRemaining === 1 ? 'point' : 'points'} remaining
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

          {/* Points Summary */}
          <div className="mb-6 p-4 bg-primary/30 rounded-lg border border-border-default">
            <div className="flex justify-between items-center">
              <span className="body-primary text-fg-primary">Skill Points</span>
              <div className="flex items-center gap-2">
                <span className="stat-medium text-fg-accent">
                  {getTotalAllocated()} / {skillPointsToAllocate}
                </span>
                {pointsRemaining === 0 && (
                  <Icon name="Check" size={20} className="text-success" />
                )}
              </div>
            </div>
          </div>

          {/* Skill List */}
          <div className="space-y-3 mb-6">
            {skills.map((skillName) => {
              const currentRanks = character.skills[skillName];
              const allocated = allocatedSkillPoints[skillName] || 0;
              const newRanks = currentRanks + allocated;
              const config = SKILL_DESCRIPTIONS[skillName];

              return (
                <div
                  key={skillName}
                  className="p-4 rounded-lg border-2 border-border-default bg-secondary/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary border border-border-default flex items-center justify-center flex-shrink-0">
                      <Icon name={config.icon} size={20} className="text-fg-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="feat-name text-fg-accent">{skillName}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-fg-muted">
                            {currentRanks}
                            {allocated > 0 && (
                              <span className="text-success">
                                {' '}
                                → {newRanks}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <p className="body-secondary text-xs text-fg-muted mb-3">{config.description}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deallocateSkillPoint(skillName)}
                          disabled={allocated === 0}
                          className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${
                            allocated > 0
                              ? 'border-warning bg-warning/20 hover:bg-warning/30 text-warning'
                              : 'border-border-default bg-secondary text-fg-muted cursor-not-allowed opacity-50'
                          }`}
                          aria-label="Remove point"
                        >
                          <Icon name="Minus" size={16} />
                        </button>
                        <div className="flex-1 h-8 rounded bg-primary/50 border border-border-default flex items-center justify-center">
                          <span className="stat-medium text-fg-accent">
                            {allocated > 0 ? `+${allocated}` : '—'}
                          </span>
                        </div>
                        <button
                          onClick={() => allocateSkillPoint(skillName)}
                          disabled={!canAllocate}
                          className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${
                            canAllocate
                              ? 'border-success bg-success/20 hover:bg-success/30 text-success'
                              : 'border-border-default bg-secondary text-fg-muted cursor-not-allowed opacity-50'
                          }`}
                          aria-label="Add point"
                        >
                          <Icon name="Plus" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="secondary" fullWidth>
              Cancel
            </Button>
            <Button
              onClick={onClose}
              variant="primary"
              fullWidth
              disabled={getTotalAllocated() !== skillPointsToAllocate}
            >
              {getTotalAllocated() === skillPointsToAllocate ? 'Confirm' : 'Allocate All Points'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
