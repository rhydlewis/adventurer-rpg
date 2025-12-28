import { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '../../components';

// =============================================================================
// Types & Configuration
// =============================================================================

type TilePattern = 'straight' | 'corner' | 't-junction' | 'cross' | 'end';
type Rotation = 0 | 90 | 180 | 270;

interface Tile {
  id: number;
  pattern: TilePattern;
  currentRotation: Rotation;
  targetRotation: Rotation;
}

interface GameConfig {
  gridSize: number;
}

const DEFAULT_CONFIG: GameConfig = {
  gridSize: 3,
};

type GameState = 'playing' | 'won';

interface RuneRotationProps {
  config?: Partial<GameConfig>;
  onSuccess: () => void;
  onFailure: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

const ROTATIONS: Rotation[] = [0, 90, 180, 270];

function getRandomRotation(): Rotation {
  return ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
}

function getRandomPattern(): TilePattern {
  const patterns: TilePattern[] = ['straight', 'corner', 't-junction', 'cross', 'end'];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

function createPuzzleGrid(config: GameConfig): Tile[] {
  const totalTiles = config.gridSize * config.gridSize;
  const tiles: Tile[] = [];

  for (let i = 0; i < totalTiles; i++) {
    const pattern = getRandomPattern();
    const targetRotation = getRandomRotation();
    const currentRotation = getRandomRotation();

    tiles.push({
      id: i,
      pattern,
      currentRotation,
      targetRotation,
    });
  }

  return tiles;
}

function rotateTile(tile: Tile): Tile {
  const currentIndex = ROTATIONS.indexOf(tile.currentRotation);
  const nextIndex = (currentIndex + 1) % ROTATIONS.length;
  return {
    ...tile,
    currentRotation: ROTATIONS[nextIndex],
  };
}

function checkWinCondition(tiles: Tile[]): boolean {
  return tiles.every(tile => tile.currentRotation === tile.targetRotation);
}

// =============================================================================
// Tile Visual Component
// =============================================================================

interface TileVisualProps {
  pattern: TilePattern;
  rotation: Rotation;
  isCorrect: boolean;
  showTarget?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

function TileVisual({ pattern, rotation, isCorrect, showTarget, onClick, disabled }: TileVisualProps) {
  const getPatternElement = () => {
    const baseClasses = "absolute transition-colors duration-200";
    const colorClass = isCorrect ? "bg-success" : showTarget ? "bg-fg-muted opacity-30" : "bg-player";

    switch (pattern) {
      case 'straight':
        return (
          <>
            <div className={`${baseClasses} ${colorClass} left-[45%] top-0 w-[10%] h-full`} />
          </>
        );
      case 'corner':
        return (
          <>
            <div className={`${baseClasses} ${colorClass} left-[45%] top-0 w-[10%] h-1/2`} />
            <div className={`${baseClasses} ${colorClass} left-1/2 top-[45%] w-1/2 h-[10%]`} />
          </>
        );
      case 't-junction':
        return (
          <>
            <div className={`${baseClasses} ${colorClass} left-[45%] top-0 w-[10%] h-full`} />
            <div className={`${baseClasses} ${colorClass} left-1/2 top-[45%] w-1/2 h-[10%]`} />
          </>
        );
      case 'cross':
        return (
          <>
            <div className={`${baseClasses} ${colorClass} left-[45%] top-0 w-[10%] h-full`} />
            <div className={`${baseClasses} ${colorClass} left-0 top-[45%] w-full h-[10%]`} />
          </>
        );
      case 'end':
        return (
          <>
            <div className={`${baseClasses} ${colorClass} left-[45%] top-0 w-[10%] h-1/2`} />
            <div className={`${baseClasses} ${colorClass} left-[40%] top-[40%] w-[20%] h-[20%] rounded-full`} />
          </>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full aspect-square rounded border-2
        ${isCorrect ? 'bg-tertiary border-success' : 'bg-tertiary border-fg-muted'}
        ${!disabled ? 'hover:border-player cursor-pointer' : 'cursor-default'}
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player
      `}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {getPatternElement()}
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function RuneRotation({ config: configOverride, onSuccess, onFailure }: RuneRotationProps) {
  const [config] = useState<GameConfig>({
    ...DEFAULT_CONFIG,
    ...configOverride,
  });
  const [tiles, setTiles] = useState<Tile[]>(() => createPuzzleGrid(config));
  const [gameState, setGameState] = useState<GameState>('playing');
  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTargets, setShowTargets] = useState(false);

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
  // Tile Rotation Handler
  // ==========================================================================

  const handleTileClick = useCallback((tileId: number) => {
    if (gameState !== 'playing') return;

    setTiles(prevTiles => {
      const newTiles = prevTiles.map(tile =>
        tile.id === tileId ? rotateTile(tile) : tile
      );

      // Check win condition
      if (checkWinCondition(newTiles)) {
        setGameState('won');
      }

      return newTiles;
    });

    setMoveCount(prev => prev + 1);
  }, [gameState]);

  // ==========================================================================
  // Game Control
  // ==========================================================================

  const handleReset = () => {
    setTiles(createPuzzleGrid(config));
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

  const correctCount = tiles.filter(t => t.currentRotation === t.targetRotation).length;
  const totalTiles = tiles.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-fg-primary p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="heading-display text-[28px] mb-2 text-fg-accent">
            Rune Rotation
          </h1>
          <p className="body-secondary text-caption mb-4">
            Rotate tiles to match the target pattern
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
              <div className="stat-small text-fg-primary">{correctCount}/{totalTiles}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Current Puzzle */}
          <Card variant="neutral" padding="default">
            <div className="mb-3">
              <h3 className="heading-tertiary text-center">Current Puzzle</h3>
            </div>
            <div
              className="grid gap-2 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
                maxWidth: '300px',
              }}
            >
              {tiles.map(tile => (
                <TileVisual
                  key={tile.id}
                  pattern={tile.pattern}
                  rotation={tile.currentRotation}
                  isCorrect={tile.currentRotation === tile.targetRotation}
                  onClick={() => handleTileClick(tile.id)}
                  disabled={gameState === 'won'}
                />
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="body-secondary text-caption">
                Click tiles to rotate them
              </p>
            </div>
          </Card>

          {/* Target Pattern */}
          <Card variant="neutral" padding="default">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="heading-tertiary">Target Pattern</h3>
              <button
                onClick={() => setShowTargets(!showTargets)}
                className="text-caption text-player hover:text-player-hover"
              >
                {showTargets ? 'Hide' : 'Show'}
              </button>
            </div>
            {showTargets ? (
              <div
                className="grid gap-2 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
                  maxWidth: '300px',
                }}
              >
                {tiles.map(tile => (
                  <TileVisual
                    key={tile.id}
                    pattern={tile.pattern}
                    rotation={tile.targetRotation}
                    isCorrect={false}
                    showTarget={true}
                    disabled={true}
                  />
                ))}
              </div>
            ) : (
              <div
                className="flex items-center justify-center bg-secondary rounded"
                style={{ height: '300px' }}
              >
                <p className="body-secondary text-caption">
                  Target hidden - click Show to reveal
                </p>
              </div>
            )}
          </Card>
        </div>

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
      </div>
    </div>
  );
}
