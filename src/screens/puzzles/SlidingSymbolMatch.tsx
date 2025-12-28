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
  { id: 'dragon', iconClass: 'ra ra-dragon' },
  { id: 'wolf', iconClass: 'ra ra-wolf-howl' },
  { id: 'flowers', iconClass: 'ra ra-flowers' },
  { id: 'blaster', iconClass: 'ra ra-blaster' },
  { id: 'fire', iconClass: 'ra ra-fire' },
  { id: 'burst', iconClass: 'ra ra-burst-blob' },
  { id: 'crystal', iconClass: 'ra ra-crystal-shine' },
  { id: 'sword', iconClass: 'ra ra-sword' },
];

interface GameConfig {
  gridSize: number;
  targetLength: number; // How many symbols need to match in a line
  symbolPool: Symbol[];
}

const DEFAULT_CONFIG: GameConfig = {
  gridSize: 5,
  targetLength: 5,
  symbolPool: SYMBOLS,
};

type GameState = 'playing' | 'won';

interface SlidingSymbolMatchProps {
  config?: Partial<GameConfig>;
  onSuccess: () => void;
  onFailure: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

function getRandomSymbol(symbols: Symbol[]): Symbol {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function createInitialGrid(config: GameConfig): Symbol[][] {
  const grid: Symbol[][] = [];
  for (let row = 0; row < config.gridSize; row++) {
    const rowData: Symbol[] = [];
    for (let col = 0; col < config.gridSize; col++) {
      rowData.push(getRandomSymbol(config.symbolPool));
    }
    grid.push(rowData);
  }
  return grid;
}

function slideRowLeft(grid: Symbol[][], rowIndex: number): Symbol[][] {
  const newGrid = grid.map(row => [...row]);
  const row = newGrid[rowIndex];
  const first = row[0];
  for (let i = 0; i < row.length - 1; i++) {
    row[i] = row[i + 1];
  }
  row[row.length - 1] = first;
  return newGrid;
}

function slideRowRight(grid: Symbol[][], rowIndex: number): Symbol[][] {
  const newGrid = grid.map(row => [...row]);
  const row = newGrid[rowIndex];
  const last = row[row.length - 1];
  for (let i = row.length - 1; i > 0; i--) {
    row[i] = row[i - 1];
  }
  row[0] = last;
  return newGrid;
}

function slideColumnUp(grid: Symbol[][], colIndex: number): Symbol[][] {
  const newGrid = grid.map(row => [...row]);
  const first = newGrid[0][colIndex];
  for (let i = 0; i < newGrid.length - 1; i++) {
    newGrid[i][colIndex] = newGrid[i + 1][colIndex];
  }
  newGrid[newGrid.length - 1][colIndex] = first;
  return newGrid;
}

function slideColumnDown(grid: Symbol[][], colIndex: number): Symbol[][] {
  const newGrid = grid.map(row => [...row]);
  const last = newGrid[newGrid.length - 1][colIndex];
  for (let i = newGrid.length - 1; i > 0; i--) {
    newGrid[i][colIndex] = newGrid[i - 1][colIndex];
  }
  newGrid[0][colIndex] = last;
  return newGrid;
}

function checkWinCondition(grid: Symbol[][], targetLength: number): boolean {
  const size = grid.length;

  // Check horizontal lines
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - targetLength; col++) {
      const symbol = grid[row][col];
      let match = true;
      for (let i = 1; i < targetLength; i++) {
        if (grid[row][col + i].id !== symbol.id) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
  }

  // Check vertical lines
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - targetLength; row++) {
      const symbol = grid[row][col];
      let match = true;
      for (let i = 1; i < targetLength; i++) {
        if (grid[row + i][col].id !== symbol.id) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
  }

  return false;
}

// =============================================================================
// Main Component
// =============================================================================

export function SlidingSymbolMatch({ config: configOverride, onSuccess, onFailure }: SlidingSymbolMatchProps) {
  const [config] = useState<GameConfig>({
    ...DEFAULT_CONFIG,
    ...configOverride,
  });
  const [grid, setGrid] = useState<Symbol[][]>(() => createInitialGrid(config));
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
  // Slide Handlers
  // ==========================================================================

  const handleSlide = useCallback((
    direction: 'left' | 'right' | 'up' | 'down',
    index: number
  ) => {
    if (gameState !== 'playing') return;

    setGrid(prevGrid => {
      let newGrid: Symbol[][];

      switch (direction) {
        case 'left':
          newGrid = slideRowLeft(prevGrid, index);
          break;
        case 'right':
          newGrid = slideRowRight(prevGrid, index);
          break;
        case 'up':
          newGrid = slideColumnUp(prevGrid, index);
          break;
        case 'down':
          newGrid = slideColumnDown(prevGrid, index);
          break;
      }

      // Check win condition
      if (checkWinCondition(newGrid, config.targetLength)) {
        setGameState('won');
      }

      return newGrid;
    });

    setMoveCount(prev => prev + 1);
  }, [config.targetLength, gameState]);

  // ==========================================================================
  // Game Control
  // ==========================================================================

  const handleReset = () => {
    setGrid(createInitialGrid(config));
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-fg-primary p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="heading-display text-[28px] mb-2 text-fg-accent">
            Sliding Symbols
          </h1>
          <p className="body-secondary text-caption mb-4">
            Slide rows and columns to align {config.targetLength} matching symbols
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
          <div className="flex flex-col items-center gap-2">
            {/* Top column controls */}
            <div className="flex gap-2" style={{ marginLeft: '52px' }}>
              {Array.from({ length: config.gridSize }).map((_, colIndex) => (
                <button
                  key={`up-${colIndex}`}
                  onClick={() => handleSlide('up', colIndex)}
                  disabled={gameState === 'won'}
                  className="w-10 h-10 bg-secondary hover:bg-secondary-hover rounded text-fg-primary disabled:opacity-50 flex items-center justify-center"
                  aria-label={`Slide column ${colIndex + 1} up`}
                >
                  <i className="ra ra-arrow-up" />
                </button>
              ))}
            </div>

            {/* Grid rows with side controls */}
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-2">
                {/* Left arrow */}
                <button
                  onClick={() => handleSlide('left', rowIndex)}
                  disabled={gameState === 'won'}
                  className="w-10 h-10 bg-secondary hover:bg-secondary-hover rounded text-fg-primary disabled:opacity-50 flex items-center justify-center"
                  aria-label={`Slide row ${rowIndex + 1} left`}
                >
                  <i className="ra ra-arrow-left" />
                </button>

                {/* Grid cells */}
                <div className="flex gap-2">
                  {row.map((symbol, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-10 h-10 rounded flex items-center justify-center text-[24px]
                        ${gameState === 'won' ? 'bg-success' : 'bg-tertiary'}
                      `}
                    >
                      <i className={symbol.iconClass} aria-hidden="true" />
                    </div>
                  ))}
                </div>

                {/* Right arrow */}
                <button
                  onClick={() => handleSlide('right', rowIndex)}
                  disabled={gameState === 'won'}
                  className="w-10 h-10 bg-secondary hover:bg-secondary-hover rounded text-fg-primary disabled:opacity-50 flex items-center justify-center"
                  aria-label={`Slide row ${rowIndex + 1} right`}
                >
                  <i className="ra ra-arrow-right" />
                </button>
              </div>
            ))}

            {/* Bottom column controls */}
            <div className="flex gap-2" style={{ marginLeft: '52px' }}>
              {Array.from({ length: config.gridSize }).map((_, colIndex) => (
                <button
                  key={`down-${colIndex}`}
                  onClick={() => handleSlide('down', colIndex)}
                  disabled={gameState === 'won'}
                  className="w-10 h-10 bg-secondary hover:bg-secondary-hover rounded text-fg-primary disabled:opacity-50 flex items-center justify-center"
                  aria-label={`Slide column ${colIndex + 1} down`}
                >
                  <i className="ra ra-arrow-down" />
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="body-secondary text-caption">
              {gameState === 'playing'
                ? 'Use arrows to slide rows and columns'
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
      </div>
    </div>
  );
}
