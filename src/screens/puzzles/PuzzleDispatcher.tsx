import type { PuzzleType, PuzzleConfig, TimingPuzzleConfig, SlidingPuzzleConfig, RotationPuzzleConfig } from '../../types/narrative';
import { TimingGame } from './TimingGame';
import { SlidingSymbolMatch } from './SlidingSymbolMatch';
import { RuneRotation } from './RuneRotation';

// =============================================================================
// Puzzle Dispatcher - Routes to correct puzzle component
// =============================================================================

interface PuzzleDispatcherProps {
  puzzleType: PuzzleType;
  config?: PuzzleConfig;
  onSuccess: () => void;
  onFailure: () => void;
}

export function PuzzleDispatcher({
  puzzleType,
  config,
  onSuccess,
  onFailure,
}: PuzzleDispatcherProps) {
  switch (puzzleType) {
    case 'timing':
      return <TimingGame config={config as Partial<TimingPuzzleConfig>} onSuccess={onSuccess} onFailure={onFailure} />;

    case 'sliding':
      return <SlidingSymbolMatch config={config as Partial<SlidingPuzzleConfig>} onSuccess={onSuccess} onFailure={onFailure} />;

    case 'rotation':
      return <RuneRotation config={config as Partial<RotationPuzzleConfig>} onSuccess={onSuccess} onFailure={onFailure} />;

    // Future puzzle types
    case 'matching':
    case 'memory':
    case 'sequence':
      // Not yet implemented - auto-fail gracefully
      console.error(`Puzzle type "${puzzleType}" is not yet implemented`);
      onFailure();
      return null;

    default:
      // Unknown puzzle type - auto-fail gracefully
      console.error(`Unknown puzzle type: ${puzzleType}`);
      onFailure();
      return null;
  }
}
