import { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '../../components';

// =============================================================================
// Types & Configuration
// =============================================================================

interface Symbol {
  id: string;
  iconClass: string;
}

const SYMBOLS: Symbol[] = [
  { id: 'sun', iconClass: 'ra ra-sun' },
  { id: 'moon', iconClass: 'ra ra-moon' },
  { id: 'star', iconClass: 'ra ra-star' },
  { id: 'crown', iconClass: 'ra ra-crown' },
  { id: 'skull', iconClass: 'ra ra-skull' },
  { id: 'key', iconClass: 'ra ra-key' },
  { id: 'heart', iconClass: 'ra ra-heart' },
  { id: 'diamond', iconClass: 'ra ra-gem' },
];

interface Dial {
  id: number;
  currentIndex: number;
  targetIndex: number;
  symbols: Symbol[];
}

interface GameConfig {
  dialCount: number;
  symbolsPerDial: number;
  linkedDials: boolean; // If true, rotating one dial affects adjacent dials
}

const DEFAULT_CONFIG: GameConfig = {
  dialCount: 4,
  symbolsPerDial: 6,
  linkedDials: false,
};

type GameState = 'playing' | 'won';

interface LockTumblerProps {
  config?: Partial<GameConfig>;
  onSuccess: () => void;
  onFailure: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createDials(config: GameConfig): Dial[] {
  const dials: Dial[] = [];

  for (let i = 0; i < config.dialCount; i++) {
    // Create a shuffled set of symbols for this dial
    const dialSymbols = shuffleArray(SYMBOLS).slice(0, config.symbolsPerDial);
    const targetIndex = Math.floor(Math.random() * config.symbolsPerDial);
    // Start at a different position than target
    let currentIndex = Math.floor(Math.random() * config.symbolsPerDial);
    while (currentIndex === targetIndex && config.symbolsPerDial > 1) {
      currentIndex = Math.floor(Math.random() * config.symbolsPerDial);
    }

    dials.push({
      id: i,
      currentIndex,
      targetIndex,
      symbols: dialSymbols,
    });
  }

  return dials;
}

function checkWinCondition(dials: Dial[]): boolean {
  return dials.every(dial => dial.currentIndex === dial.targetIndex);
}

// =============================================================================
// Main Component
// =============================================================================

export function LockTumbler({ config: configOverride, onSuccess, onFailure }: LockTumblerProps) {
  const [config] = useState<GameConfig>({
    ...DEFAULT_CONFIG,
    ...configOverride,
  });
  const [dials, setDials] = useState<Dial[]>(() => createDials(config));
  const [gameState, setGameState] = useState<GameState>('playing');
  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // ==========================================================================
  // Timer for display (elapsed time)
  // ==========================================================================

  useEffect(() => {
    if (gameState !== 'playing') return;

    const displayTimer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(displayTimer);
  }, [gameState, startTime]);

  // ==========================================================================
  // Dial Rotation Handler
  // ==========================================================================

  const handleRotateDial = useCallback((dialId: number) => {
    if (gameState !== 'playing') return;

    setDials(prevDials => {
      const newDials = prevDials.map(dial => {
        if (dial.id === dialId) {
          // Rotate this dial forward
          return {
            ...dial,
            currentIndex: (dial.currentIndex + 1) % dial.symbols.length,
          };
        } else if (config.linkedDials) {
          // If linked mode, rotate adjacent dials
          if (dial.id === dialId - 1 || dial.id === dialId + 1) {
            return {
              ...dial,
              currentIndex: (dial.currentIndex + 1) % dial.symbols.length,
            };
          }
        }
        return dial;
      });

      // Check win condition
      if (checkWinCondition(newDials)) {
        setGameState('won');
      }

      return newDials;
    });

    setMoveCount(prev => prev + 1);
  }, [config.linkedDials, gameState]);

  // ==========================================================================
  // Game Control
  // ==========================================================================

  const handleReset = () => {
    setDials(createDials(config));
    setGameState('playing');
    setMoveCount(0);
    setElapsedTime(0);
  };

  const handleExit = () => {
    if (gameState === 'won') {
      onSuccess();
    } else {
      onFailure();
    }
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const deciseconds = Math.floor((ms % 1000) / 100);
    return `${seconds}.${deciseconds}s`;
  };

  const correctCount = dials.filter(d => d.currentIndex === d.targetIndex).length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-fg-primary p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="heading-display text-[28px] mb-2 text-fg-accent">
            Lock Tumbler
          </h1>
          <p className="body-secondary text-caption mb-4">
            Rotate dials to match the target symbols{config.linkedDials ? ' (linked mode!)' : ''}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-4">
            <div>
              <div className="label-secondary">Time</div>
              <div className="stat-small text-fg-primary">{formatTime(elapsedTime)}</div>
            </div>
            <div>
              <div className="label-secondary">Moves</div>
              <div className="stat-small text-fg-primary">{moveCount}</div>
            </div>
            <div>
              <div className="label-secondary">Correct</div>
              <div className="stat-small text-fg-primary">{correctCount}/{dials.length}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Current Lock */}
          <Card variant="neutral" padding="default">
            <div className="mb-3">
              <h3 className="heading-tertiary text-center">Current Lock</h3>
            </div>
            <div className="flex flex-col gap-4">
              {dials.map(dial => {
                const currentSymbol = dial.symbols[dial.currentIndex];
                const isCorrect = dial.currentIndex === dial.targetIndex;

                return (
                  <div key={dial.id} className="flex items-center gap-3">
                    {/* Dial label */}
                    <div className="label-secondary w-12">Dial {dial.id + 1}</div>

                    {/* Dial display */}
                    <div
                      className={`
                        flex-1 rounded-lg border-2 p-4 flex items-center justify-center
                        ${isCorrect ? 'bg-tertiary border-success' : 'bg-tertiary border-fg-muted'}
                        transition-all duration-200
                      `}
                    >
                      <i
                        className={`${currentSymbol.iconClass} text-[48px]`}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Rotate button */}
                    <button
                      onClick={() => handleRotateDial(dial.id)}
                      disabled={gameState === 'won'}
                      className="w-12 h-12 bg-player hover:bg-player-hover rounded text-fg-primary disabled:opacity-50 flex items-center justify-center transition-colors"
                      aria-label={`Rotate dial ${dial.id + 1}`}
                    >
                      <i className="ra ra-cycle" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-center">
              <p className="body-secondary text-caption">
                Click arrows to rotate dials
              </p>
            </div>
          </Card>

          {/* Target Pattern */}
          <Card variant="neutral" padding="default">
            <div className="mb-3">
              <h3 className="heading-tertiary text-center">Target Pattern</h3>
            </div>
            <div className="flex flex-col gap-4">
              {dials.map(dial => {
                const targetSymbol = dial.symbols[dial.targetIndex];

                return (
                  <div key={dial.id} className="flex items-center gap-3">
                    {/* Dial label */}
                    <div className="label-secondary w-12">Dial {dial.id + 1}</div>

                    {/* Target display */}
                    <div className="flex-1 rounded-lg border-2 border-fg-muted bg-secondary p-4 flex items-center justify-center opacity-75">
                      <i
                        className={`${targetSymbol.iconClass} text-[48px]`}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Spacer to align with rotate button */}
                    <div className="w-12" />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Game Over / Win Screen */}
        {gameState === 'won' && (
          <Card variant="neutral" padding="compact" className="mb-4 border-success">
            <div className="text-center">
              <h2 className="heading-secondary text-success mb-2">Lock Opened!</h2>
              <p className="body-primary mb-2">
                Completed in {formatTime(elapsedTime)}
              </p>
              <p className="body-secondary text-caption">
                {moveCount} moves
              </p>
            </div>
          </Card>
        )}

        {/* Controls */}
        <div className="space-y-2">
          {gameState === 'won' ? (
            <>
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handleReset}
              >
                Play Again
              </Button>
              <Button
                variant="secondary"
                size="large"
                fullWidth
                onClick={handleExit}
              >
                Exit
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="large"
                fullWidth
                onClick={handleReset}
              >
                Restart
              </Button>
              <Button
                variant="secondary"
                size="large"
                fullWidth
                onClick={handleExit}
              >
                Exit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
