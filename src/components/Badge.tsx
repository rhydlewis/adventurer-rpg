import type { ReactNode } from 'react';

interface BadgeProps {
  /**
   * Badge type determines color scheme
   * - buff: Green (positive effects)
   * - debuff: Red (negative effects)
   */
  type: 'buff' | 'debuff';

  /**
   * Optional icon to display (typically Lucide React icon)
   */
  icon?: ReactNode;

  /**
   * Badge content (condition name or effect description)
   */
  children: ReactNode;

  /**
   * Optional duration in turns (e.g., 2 for "2 turns")
   * If provided, displays as "(Nt)" where N is the number
   */
  duration?: number;

  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * Badge component for displaying conditions, buffs, and debuffs.
 *
 * Color scheme:
 * - Buffs: Green background (success)
 * - Debuffs: Red background (danger)
 *
 * Features:
 * - Compact inline display
 * - Icon support with proper spacing
 * - Duration indicator with turn count
 * - White text on colored background for contrast
 *
 * @example
 * <Badge type="buff" icon={<Icon name="Shield" size={14} />} duration={3}>
 *   Dodge: +4 AC
 * </Badge>
 *
 * @example
 * <Badge type="debuff" duration={1}>
 *   Off-Balance: -2 attack
 * </Badge>
 */
export function Badge({
  type,
  icon,
  children,
  duration,
  className = '',
}: BadgeProps) {
  // Type-based color schemes
  const colorClasses = {
    buff: 'bg-success text-white',
    debuff: 'bg-enemy text-white',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        px-2 py-1
        rounded
        text-caption font-inter font-medium
        ${colorClasses[type]}
        ${className}
      `.trim()}
    >
      {/* Icon (if provided) */}
      {icon && <span aria-hidden="true">{icon}</span>}

      {/* Badge content */}
      <span>{children}</span>

      {/* Duration indicator */}
      {duration !== undefined && (
        <span className="opacity-75">
          ({duration} turn{duration !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
}
