import { useState, useCallback, useEffect } from 'react';
import { Button, Card, Icon } from '../components';

interface LockPickingScreenProps {
  /**
   * Difficulty level affects sweet spot size
   */
  difficulty: 'easy' | 'medium' | 'hard';

  /**
   * Callback when lock is successfully picked
   */
  onSuccess: () => void;

  /**
   * Callback when pick breaks or time runs out
   */
  onFailure: () => void;

  /**
   * Optional callback to exit minigame early
   */
  onExit?: () => void;
}

// Number of positions around the lock (like a clock)
const NUM_POSITIONS = 12;

// Helper to determine the target parameters based on difficulty
const getTargetParams = (difficulty: LockPickingScreenProps['difficulty']) => {
  switch (difficulty) {
    case 'easy':
      return {
        tolerancePositions: 2, // Within 2 positions = success
        sweetSpotPosition: Math.floor(Math.random() * NUM_POSITIONS),
        startingDurability: 100,
        damagePerMiss: 15,
      };
    case 'medium':
      return {
        tolerancePositions: 1, // Within 1 position = success
        sweetSpotPosition: Math.floor(Math.random() * NUM_POSITIONS),
        startingDurability: 100,
        damagePerMiss: 20,
      };
    case 'hard':
      return {
        tolerancePositions: 0, // Exact position only
        sweetSpotPosition: Math.floor(Math.random() * NUM_POSITIONS),
        startingDurability: 100,
        damagePerMiss: 25,
      };
  }
};

/**
 * Lock Picking minigame screen
 *
 * Gameplay:
 * - Adjust the pick position using arrow buttons
 * - Apply tension to test if the position is correct
 * - Get visual feedback (vibration color) when close
 * - Success: Pick the lock within durability limit
 * - Failure: Pick breaks when durability reaches 0
 *
 * Mobile-friendly features:
 * - Large touch targets (44x44px minimum)
 * - Clear visual feedback
 * - Simple tap-based controls
 */
export function LockPickingScreen({
  difficulty,
  onSuccess,
  onFailure,
  onExit,
}: LockPickingScreenProps) {
  const params = getTargetParams(difficulty);

  const [pickPosition, setPickPosition] = useState(0);
  const [durability, setDurability] = useState(params.startingDurability);
  const [tension, setTension] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'close' | 'veryClose'>('none');
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate how close the pick is to the sweet spot
  const getDistance = useCallback(
    (pos: number): number => {
      const diff = Math.abs(pos - params.sweetSpotPosition);
      // Handle wraparound (e.g., position 11 is close to position 0)
      return Math.min(diff, NUM_POSITIONS - diff);
    },
    [params.sweetSpotPosition]
  );

  // Update visual feedback based on proximity
  useEffect(() => {
    const distance = getDistance(pickPosition);
    if (distance === 0) {
      setFeedback('veryClose');
    } else if (distance <= 1) {
      setFeedback('close');
    } else {
      setFeedback('none');
    }
  }, [pickPosition, getDistance]);

  const adjustPosition = (direction: 'left' | 'right') => {
    setPickPosition((prev) => {
      if (direction === 'right') {
        return (prev + 1) % NUM_POSITIONS;
      } else {
        return (prev - 1 + NUM_POSITIONS) % NUM_POSITIONS;
      }
    });
  };

  const applyTension = () => {
    if (durability <= 0 || isAnimating) return;

    setIsAnimating(true);
    setTension(100);

    const distance = getDistance(pickPosition);
    const isSuccess = distance <= params.tolerancePositions;

    if (isSuccess) {
      // Success! Lock opens
      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      // Miss - take damage
      const newDurability = Math.max(0, durability - params.damagePerMiss);
      setDurability(newDurability);

      // Tension animation
      setTimeout(() => {
        setTension(0);
        setIsAnimating(false);

        if (newDurability <= 0) {
          onFailure();
        }
      }, 600);
    }
  };

  // Calculate rotation for visual pick indicator
  const pickRotation = (pickPosition / NUM_POSITIONS) * 360;

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        {/* Header */}
        <Card variant="neutral" padding="compact">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Lock" className="text-warning" />
              <div>
                <h1 className="heading-primary text-h1 text-text-primary">Lock Picking</h1>
                <p className="text-caption text-text-muted label-secondary">
                  Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </p>
              </div>
            </div>
            {onExit && (
              <Button variant="secondary" onClick={onExit} className="text-sm">
                Exit
              </Button>
            )}
          </div>
        </Card>

        {/* Instructions */}
        <Card variant="neutral" padding="compact">
          <p className="text-body text-text-primary body-primary text-center">
            Adjust the pick position and apply tension to open the lock. Watch the durability!
          </p>
        </Card>

        {/* Lock Visual */}
        <Card variant="player" padding="spacious">
          <div className="flex flex-col items-center">
            {/* Lock Cylinder */}
            <div className="relative w-48 h-48 mb-4">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full bg-secondary border-4 border-border-default" />

              {/* Position markers */}
              {Array.from({ length: NUM_POSITIONS }).map((_, i) => {
                const angle = (i / NUM_POSITIONS) * 360;
                const isCurrentPosition = i === pickPosition;
                return (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full transition-all duration-200"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-85px)`,
                      backgroundColor: isCurrentPosition
                        ? 'var(--color-player)'
                        : 'var(--color-border-default)',
                      width: isCurrentPosition ? '12px' : '8px',
                      height: isCurrentPosition ? '12px' : '8px',
                    }}
                  />
                );
              })}

              {/* Center lock core */}
              <div
                className={`absolute inset-8 rounded-full transition-all duration-300 ${
                  feedback === 'veryClose'
                    ? 'bg-success shadow-lg shadow-success/50'
                    : feedback === 'close'
                      ? 'bg-warning shadow-lg shadow-warning/50'
                      : 'bg-gray-700'
                }`}
              />

              {/* Pick indicator */}
              <div
                className="absolute top-1/2 left-1/2 w-1 bg-text-accent transition-all duration-300"
                style={{
                  height: tension > 0 ? '65px' : '70px',
                  transformOrigin: 'bottom center',
                  transform: `translate(-50%, -100%) rotate(${pickRotation}deg)`,
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-text-accent rounded-full" />
              </div>

              {/* Tension effect */}
              {tension > 0 && (
                <div className="absolute inset-0 rounded-full bg-enemy/20 animate-pulse" />
              )}
            </div>

            {/* Feedback text */}
            <div className="h-6 mb-2">
              {feedback === 'veryClose' && (
                <p className="text-success button-text text-body animate-pulse">
                  Very close!
                </p>
              )}
              {feedback === 'close' && (
                <p className="text-warning button-text text-body">Getting warm...</p>
              )}
            </div>
          </div>
        </Card>

        {/* Durability Bar */}
        <Card variant="enemy" padding="compact">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="button-text text-body text-text-primary">
                Pick Durability
              </span>
              <span className="body-primary text-body text-text-primary">{durability}%</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  durability > 50
                    ? 'bg-success'
                    : durability > 25
                      ? 'bg-warning'
                      : 'bg-enemy'
                }`}
                style={{ width: `${durability}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Controls */}
        <div className="space-y-3">
          {/* Position adjustment */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="secondary"
              onClick={() => adjustPosition('left')}
              disabled={isAnimating}
              icon={<Icon name="ChevronLeft" />}
            >
              Left
            </Button>

            <Button
              variant="primary"
              onClick={applyTension}
              disabled={durability <= 0 || isAnimating}
              icon={<Icon name="LockOpen" />}
            >
              Apply Tension
            </Button>

            <Button
              variant="secondary"
              onClick={() => adjustPosition('right')}
              disabled={isAnimating}
              icon={<Icon name="ChevronRight" />}
            >
              Right
            </Button>
          </div>

          {/* Position display */}
          <Card variant="neutral" padding="compact">
            <p className="text-center body-primary text-body text-text-primary">
              Position: {pickPosition + 1} / {NUM_POSITIONS}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
