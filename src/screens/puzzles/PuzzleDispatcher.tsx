import type { PuzzleType, PuzzleConfig, TimingPuzzleConfig } from '../../types/narrative';
import { TimingGame } from './TimingGame';

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
