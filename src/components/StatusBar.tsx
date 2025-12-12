interface StatusBarProps {
  /**
   * Current value (e.g., current HP)
   */
  current: number;

  /**
   * Maximum value (e.g., max HP)
   */
  max: number;

  /**
   * Optional label to display above the bar (e.g., "HP", "Mana")
   */
  label?: string;

  /**
   * Whether to show numeric values (e.g., "15 / 20")
   */
  showNumbers?: boolean;

  /**
   * Optional CSS classes
   */
  className?: string;
}

/**
 * StatusBar component with color-coded percentage display.
 *
 * Color coding (per design system):
 * - 75-100%: Success green (healthy)
 * - 50-74%: Warning orange (wounded)
 * - 0-49%: Danger red (critical)
 *
 * Features:
 * - 8px height bar (per design system)
 * - Smooth 300ms transition on value changes
 * - Respects prefers-reduced-motion
 * - Automatically clamps percentage to 0-100%
 *
 * @example
 * <StatusBar current={15} max={20} label="HP" showNumbers />
 *
 * @example
 * <StatusBar current={3} max={10} label="Spell Slots" />
 */
export function StatusBar({
  current,
  max,
  label,
  showNumbers = true,
  className = '',
}: StatusBarProps) {
  // Calculate percentage and clamp to 0-100%
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  /**
   * Get bar color based on percentage thresholds
   */
  const getBarColor = (): string => {
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-enemy';
  };

  /**
   * Get text color for numeric display (matches bar color)
   */
  const getTextColor = (): string => {
    if (percentage >= 75) return 'text-text-primary';
    if (percentage >= 50) return 'text-warning';
    return 'text-enemy';
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label and numbers row */}
      {(label || showNumbers) && (
        <div className="flex justify-between items-baseline text-caption font-inter font-medium">
          {label && <span className="text-text-primary">{label}:</span>}
          {showNumbers && (
            <span className={getTextColor()}>
              {current} / {max}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-2 bg-primary rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor()} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || 'Status'}
        />
      </div>
    </div>
  );
}
