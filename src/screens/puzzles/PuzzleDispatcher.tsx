import type { PuzzleType, PuzzleConfig, TimingPuzzleConfig, SlidingPuzzleConfig, RotationPuzzleConfig, TumblerPuzzleConfig, PressurePuzzleConfig } from '../../types';
import { TimingGame } from './TimingGame';
import { SlidingSymbolMatch } from './SlidingSymbolMatch';
import { RuneRotation } from './RuneRotation';
import { LockTumbler } from './LockTumbler';
import { PressurePlates } from './PressurePlates';

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

    case 'tumbler':
      return <LockTumbler config={config as Partial<TumblerPuzzleConfig>} onSuccess={onSuccess} onFailure={onFailure} />;

    case 'pressure':
      return <PressurePlates config={config as Partial<PressurePuzzleConfig>} onSuccess={onSuccess} onFailure={onFailure} />;

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
