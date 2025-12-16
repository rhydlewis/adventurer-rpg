import type { LogEntry } from '../../types';

interface NarrativeLogProps {
  /**
   * Array of log entries to display
   */
  entries: LogEntry[];

  /**
   * Optional className for additional styling
   */
  className?: string;
}

/**
 * Displays narrative log entries with appropriate styling for each type.
 *
 * Entry types:
 * - narrative: Story text and NPC dialogue (with optional speaker name)
 * - playerChoice: What the player selected (indented, player color)
 * - skillCheck: Dice roll results with success/failure coloring
 * - effect: System messages (item received, HP changes, etc.)
 * - companion: Hints from the companion character
 *
 * @example
 * <NarrativeLog entries={conversation.log} />
 */
export function NarrativeLog({ entries, className = '' }: NarrativeLogProps) {
  if (entries.length === 0) {
    return (
      <div className={`text-fg-muted text-sm italic font-inter ${className}`}>
        Your adventure begins...
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {entries.map((entry, index) => (
        <div key={index}>
          {entry.type === 'narrative' && (
            <div className="text-fg-primary font-inter text-body">
              {entry.speaker && (
                <div className="font-semibold text-player mb-1">
                  {entry.speaker}:
                </div>
              )}
              <div>{entry.text}</div>
            </div>
          )}

          {entry.type === 'playerChoice' && (
            <div className="text-player font-semibold font-inter text-body pl-4 border-l-2 border-player">
              → {entry.text}
            </div>
          )}

          {entry.type === 'skillCheck' && (
            <div
              className={`font-mono text-sm pl-4 border-l-2 ${
                entry.success
                  ? 'text-success border-success'
                  : 'text-enemy border-enemy'
              }`}
            >
              <div>
                <span className="font-semibold">{entry.skill} Check:</span> 1d20
                [{entry.roll}] + {entry.modifier} = {entry.total} vs DC{' '}
                {entry.dc}
              </div>
              <div className="font-semibold">
                {entry.success ? '✓ SUCCESS' : '✗ FAILURE'}
              </div>
            </div>
          )}

          {entry.type === 'effect' && (
            <div className="text-fg-muted font-inter text-sm italic pl-4 border-l-2 border-border-default">
              {entry.message}
            </div>
          )}

          {entry.type === 'companion' && (
            <div className="bg-secondary border-2 border-hint rounded-lg p-3">
              <div className="text-hint font-semibold text-sm mb-1 font-inter">
                Companion Hint:
              </div>
              <div className="text-fg-secondary text-sm font-inter">
                {entry.hint}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
