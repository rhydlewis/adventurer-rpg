import { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '../components';

// =============================================================================
// Types & Configuration
// =============================================================================

interface Symbol {
  id: string;
  iconClass: string;
}

const SYMBOLS: Symbol[] = [
  { id: 'dragon', iconClass: 'ra ra-dragon' },
  { id: 'wolf', iconClass: 'ra ra-wolf-howl' },
  { id: 'flowers', iconClass: 'ra ra-flowers' },
  { id: 'blaster', iconClass: 'ra ra-blaster' },
  { id: 'fire', iconClass: 'ra ra-fire' },
  { id: 'burst', iconClass: 'ra ra-burst-blob' },
];

interface GameConfig {
  gridSize: number;
  symbolPool: Symbol[];
  tickInterval: number; // milliseconds
  lockDuration: number; // milliseconds
  autoUnlock: boolean;
  allowManualUnlock: boolean;
}

const DEFAULT_CONFIG: GameConfig = {
  gridSize: 2,
  symbolPool: SYMBOLS,
  tickInterval: 1500, // 1 second
  lockDuration: 5000, // 3 seconds
  autoUnlock: true,
  allowManualUnlock: true,
};

type ButtonState = 'unlocked' | 'locked';
type GameState = 'playing' | 'won';

interface ButtonData {
  id: number;
  state: ButtonState;
  symbol: Symbol;
  lockTimeRemaining: number; // milliseconds
}

interface TimingGameProps {
  onSuccess: () => void;
  onFailure: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

function getRandomSymbol(symbols: Symbol[], excludeCurrent?: Symbol): Symbol {
  const availableSymbols = excludeCurrent
    ? symbols.filter(s => s.id !== excludeCurrent.id)
    : symbols;

  if (availableSymbols.length === 0) {
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  return availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
}

function createInitialButtons(config: GameConfig): ButtonData[] {
  const totalButtons = config.gridSize * config.gridSize;
  return Array.from({ length: totalButtons }, (_, i) => ({
    id: i,
    state: 'unlocked' as ButtonState,
    symbol: getRandomSymbol(config.symbolPool),
    lockTimeRemaining: 0,
  }));
}

// =============================================================================
// Main Component
// =============================================================================

export function TimingGame({ onSuccess, onFailure }: TimingGameProps) {
  const [config] = useState<GameConfig>(DEFAULT_CONFIG);
  const [buttons, setButtons] = useState<ButtonData[]>(() => createInitialButtons(config));
  const [gameState, setGameState] = useState<GameState>('playing');
  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // ==========================================================================
  // Win Condition Check
  // ==========================================================================

  const checkWinCondition = useCallback((currentButtons: ButtonData[]): boolean => {
    const allLocked = currentButtons.every(btn => btn.state === 'locked');
    if (!allLocked) return false;

    const firstSymbol = currentButtons[0].symbol;
    const allMatch = currentButtons.every(btn => btn.symbol.id === firstSymbol.id);
    return allMatch;
  }, []);

  // ==========================================================================
  // Event: TICK
  // ==========================================================================

  useEffect(() => {
    if (gameState !== 'playing') return;

    const tickTimer = setInterval(() => {
      setButtons(prevButtons => {
        const newButtons = prevButtons.map(btn => {
          // Step 1: Update symbols for unlocked buttons
          if (btn.state === 'unlocked') {
            return {
              ...btn,
              symbol: getRandomSymbol(config.symbolPool, btn.symbol),
            };
          }
          return btn;
        });

        // Step 2: Process lock expirations
        const buttonsAfterExpiry = newButtons.map(btn => {
          if (btn.state === 'locked') {
            const newTimeRemaining = Math.max(0, btn.lockTimeRemaining - config.tickInterval);

            if (newTimeRemaining === 0 && config.autoUnlock) {
              // LOCK_EXPIRE event: transition to unlocked
              return {
                ...btn,
                state: 'unlocked' as ButtonState,
                lockTimeRemaining: 0,
                symbol: getRandomSymbol(config.symbolPool),
              };
            }

            return {
              ...btn,
              lockTimeRemaining: newTimeRemaining,
            };
          }
          return btn;
        });

        // Step 3: Check win condition
        if (checkWinCondition(buttonsAfterExpiry)) {
          setGameState('won');
        }

        return buttonsAfterExpiry;
      });
    }, config.tickInterval);

    return () => clearInterval(tickTimer);
  }, [config, gameState, checkWinCondition]);

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
  // Event: PRESS(i)
  // ==========================================================================

  const handleButtonPress = useCallback((buttonId: number) => {
    if (gameState !== 'playing') return;

    setButtons(prevButtons => {
      const newButtons = prevButtons.map(btn => {
        if (btn.id !== buttonId) return btn;

        // Per-button state machine
        if (btn.state === 'unlocked') {
          // U → L: Lock the button
          setMoveCount(prev => prev + 1);
          return {
            ...btn,
            state: 'locked' as ButtonState,
            lockTimeRemaining: config.lockDuration,
          };
        } else {
          // L → U (if allowed): Unlock the button
          if (config.allowManualUnlock) {
            setMoveCount(prev => prev + 1);
            return {
              ...btn,
              state: 'unlocked' as ButtonState,
              lockTimeRemaining: 0,
            };
          }
          return btn;
        }
      });

      // Check win condition
      if (checkWinCondition(newButtons)) {
        setGameState('won');
      }

      return newButtons;
    });
  }, [config, gameState, checkWinCondition]);

  // ==========================================================================
  // Game Control
  // ==========================================================================

  const handleReset = () => {
    setButtons(createInitialButtons(config));
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
  // Near-Miss Detection
  // ==========================================================================

  const getNearMissInfo = (): { isNearMiss: boolean; mismatchId: number | null } => {
    if (gameState !== 'playing') return { isNearMiss: false, mismatchId: null };

    const lockedButtons = buttons.filter(btn => btn.state === 'locked');
    if (lockedButtons.length !== 3) return { isNearMiss: false, mismatchId: null };

    const symbols = lockedButtons.map(btn => btn.symbol);
    const firstSymbol = symbols[0];
    const allMatch = symbols.every(s => s.id === firstSymbol.id);

    if (allMatch) {
      const unlockedButton = buttons.find(btn => btn.state === 'unlocked');
      if (unlockedButton && unlockedButton.symbol.id !== firstSymbol.id) {
        return { isNearMiss: true, mismatchId: unlockedButton.id };
      }
    }

    return { isNearMiss: false, mismatchId: null };
  };

  const nearMissInfo = getNearMissInfo();

  // ==========================================================================
  // Render
  // ==========================================================================

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const deciseconds = Math.floor((ms % 1000) / 100);
    return `${seconds}.${deciseconds}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-fg-primary p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="heading-display text-[28px] mb-2 text-fg-accent">
            Symbol Match
          </h1>
          <p className="body-secondary text-caption mb-4">
            Lock all buttons with matching symbols
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
          </div>
        </div>

        {/* Game Grid */}
        <Card variant="neutral" padding="default" className="mb-4">
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
            }}
          >
            {buttons.map(btn => {
              const isLocked = btn.state === 'locked';
              const lockProgress = btn.lockTimeRemaining / config.lockDuration;
              const isNearMismatch = nearMissInfo.isNearMiss && nearMissInfo.mismatchId === btn.id;

              return (
                <button
                  key={btn.id}
                  onClick={() => handleButtonPress(btn.id)}
                  disabled={gameState === 'won'}
                  className={`
                    relative aspect-square rounded-lg text-[48px]
                    flex items-center justify-center
                    transition-all duration-200
                    ${isLocked
                      ? 'bg-player border-2 border-player scale-95'
                      : 'bg-secondary border-2 border-transparent hover:border-fg-muted active:scale-95'
                    }
                    ${isNearMismatch ? 'border-enemy border-2 animate-pulse' : ''}
                    ${gameState === 'won' ? 'bg-success border-success' : ''}
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player
                    min-h-[100px]
                  `}
                  aria-label={`Button ${btn.id + 1}: ${btn.symbol.id}, ${isLocked ? 'locked' : 'unlocked'}`}
                >
                  <i
                    className={`${btn.symbol.iconClass} ${isLocked ? 'opacity-75' : 'opacity-100'}`}
                    aria-hidden="true"
                  />

                  {/* Lock Timer Ring */}
                  {isLocked && lockProgress > 0 && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${lockProgress * 289} 289`}
                        className="text-fg-accent opacity-50"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="body-secondary text-caption">
              {gameState === 'playing'
                ? 'Click buttons to lock/unlock symbols. Match all 4!'
                : 'You won! 🎉'
              }
            </p>
          </div>
        </Card>

        {/* Game Over / Win Screen */}
        {gameState === 'won' && (
          <Card variant="neutral" padding="compact" className="mb-4 border-success">
            <div className="text-center">
              <h2 className="heading-secondary text-success mb-2">Victory!</h2>
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

        {/* Debug Info */}
        <div className="mt-4 p-2 bg-secondary rounded text-caption font-mono">
          <div>Config: {config.tickInterval}ms tick, {config.lockDuration}ms lock</div>
          <div>
            Locked: {buttons.filter(b => b.state === 'locked').length}/4
            {' | '}
            Match: {new Set(buttons.filter(b => b.state === 'locked').map(b => b.symbol.id)).size === 1 ? '✓' : '✗'}
          </div>
        </div>
      </div>
    </div>
  );
}
