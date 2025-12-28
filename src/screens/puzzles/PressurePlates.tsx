import { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '../../components';

// =============================================================================
// Types & Configuration
// =============================================================================

interface Plate {
  id: number;
  row: number;
  col: number;
  active: boolean;
}

interface GameConfig {
  gridSize: number;
  togglePattern: 'cross' | 'plus' | 'diagonal' | 'adjacent';
  // cross = center + 4 adjacent (up, down, left, right)
  // plus = same as cross
  // diagonal = center + 4 diagonals
  // adjacent = center + all 8 surrounding
}

const DEFAULT_CONFIG: GameConfig = {
  gridSize: 3,
  togglePattern: 'cross',
};

type GameState = 'playing' | 'won';

interface PressurePlatesProps {
  config?: Partial<GameConfig>;
  onSuccess: () => void;
  onFailure: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

function createInitialGrid(config: GameConfig): Plate[] {
  const plates: Plate[] = [];
  const size = config.gridSize;

  // Create all plates
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      plates.push({
        id: row * size + col,
        row,
        col,
        active: Math.random() > 0.5, // Random starting state
      });
    }
  }

  // Ensure puzzle is solvable by ensuring not all plates are the same
  const allActive = plates.every(p => p.active);
  const allInactive = plates.every(p => !p.active);

  if (allActive || allInactive) {
    // Toggle a random plate to ensure mixed state
    const randomPlate = plates[Math.floor(Math.random() * plates.length)];
    randomPlate.active = !randomPlate.active;
  }

  return plates;
}

function getAffectedPlates(
  row: number,
  col: number,
  gridSize: number,
  pattern: GameConfig['togglePattern']
): { row: number; col: number }[] {
  const affected: { row: number; col: number }[] = [];

  // Always include the clicked plate
  affected.push({ row, col });

  switch (pattern) {
    case 'cross':
    case 'plus':
      // Adjacent in 4 directions (up, down, left, right)
      if (row > 0) affected.push({ row: row - 1, col });
      if (row < gridSize - 1) affected.push({ row: row + 1, col });
      if (col > 0) affected.push({ row, col: col - 1 });
      if (col < gridSize - 1) affected.push({ row, col: col + 1 });
      break;

    case 'diagonal':
      // Diagonal directions
      if (row > 0 && col > 0) affected.push({ row: row - 1, col: col - 1 });
      if (row > 0 && col < gridSize - 1) affected.push({ row: row - 1, col: col + 1 });
      if (row < gridSize - 1 && col > 0) affected.push({ row: row + 1, col: col - 1 });
      if (row < gridSize - 1 && col < gridSize - 1) affected.push({ row: row + 1, col: col + 1 });
      break;

    case 'adjacent':
      // All 8 surrounding plates
      for (let r = Math.max(0, row - 1); r <= Math.min(gridSize - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(gridSize - 1, col + 1); c++) {
          if (r !== row || c !== col) {
            affected.push({ row: r, col: c });
          }
        }
      }
      break;
  }

  return affected;
}

function togglePlates(
  plates: Plate[],
  row: number,
  col: number,
  gridSize: number,
  pattern: GameConfig['togglePattern']
): Plate[] {
  const affected = getAffectedPlates(row, col, gridSize, pattern);
  const affectedSet = new Set(affected.map(p => `${p.row},${p.col}`));

  return plates.map(plate => {
    const key = `${plate.row},${plate.col}`;
    if (affectedSet.has(key)) {
      return { ...plate, active: !plate.active };
    }
    return plate;
  });
}

function checkWinCondition(plates: Plate[]): boolean {
  return plates.every(plate => plate.active);
}

// =============================================================================
// Main Component
// =============================================================================

export function PressurePlates({ config: configOverride, onSuccess, onFailure }: PressurePlatesProps) {
  const [config] = useState<GameConfig>({
    ...DEFAULT_CONFIG,
    ...configOverride,
  });
  const [plates, setPlates] = useState<Plate[]>(() => createInitialGrid(config));
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
  // Plate Press Handler
  // ==========================================================================

  const handlePressPlate = useCallback((row: number, col: number) => {
    if (gameState !== 'playing') return;

    setPlates(prevPlates => {
      const newPlates = togglePlates(prevPlates, row, col, config.gridSize, config.togglePattern);

      // Check win condition
      if (checkWinCondition(newPlates)) {
        setGameState('won');
      }

      return newPlates;
    });

    setMoveCount(prev => prev + 1);
  }, [config.gridSize, config.togglePattern, gameState]);

  // ==========================================================================
  // Game Control
  // ==========================================================================

  const handleReset = () => {
    setPlates(createInitialGrid(config));
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

  const activeCount = plates.filter(p => p.active).length;
  const totalPlates = plates.length;

  const getPatternDescription = () => {
    switch (config.togglePattern) {
      case 'cross':
      case 'plus':
        return 'Toggles clicked plate + 4 adjacent';
      case 'diagonal':
        return 'Toggles clicked plate + 4 diagonals';
      case 'adjacent':
        return 'Toggles clicked plate + all 8 surrounding';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-fg-primary p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="heading-display text-[28px] mb-2 text-fg-accent">
            Pressure Plates
          </h1>
          <p className="body-secondary text-caption mb-4">
            Activate all pressure plates simultaneously
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
              <div className="label-secondary">Active</div>
              <div className="stat-small text-fg-primary">{activeCount}/{totalPlates}</div>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <Card variant="neutral" padding="default" className="mb-4">
          <div
            className="grid gap-2 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
              maxWidth: '300px',
            }}
          >
            {plates.map(plate => (
              <button
                key={plate.id}
                onClick={() => handlePressPlate(plate.row, plate.col)}
                disabled={gameState === 'won'}
                className={`
                  relative aspect-square rounded-lg
                  flex items-center justify-center text-[32px]
                  transition-all duration-200
                  ${plate.active
                    ? 'bg-success border-2 border-success shadow-lg scale-95'
                    : 'bg-secondary border-2 border-fg-muted hover:border-player'
                  }
                  ${gameState === 'won' ? 'bg-success border-success' : ''}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player
                  disabled:cursor-default
                `}
                aria-label={`Plate at row ${plate.row + 1}, column ${plate.col + 1}: ${plate.active ? 'active' : 'inactive'}`}
              >
                {plate.active && (
                  <i className="ra ra-relic-blade opacity-75" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center space-y-1">
            <p className="body-secondary text-caption">
              {gameState === 'playing'
                ? 'Click plates to toggle them'
                : 'All plates activated!'}
            </p>
            <p className="body-secondary text-caption text-fg-muted">
              {getPatternDescription()}
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
      </div>
    </div>
  );
}
