import type { ReactNode } from 'react';

interface CardProps {
  /**
   * Visual variant determines border color
   * - player: Blue border (player character)
   * - enemy: Red border (enemy creatures)
   * - neutral: Gray border (generic content)
   */
  variant: 'player' | 'enemy' | 'neutral';

  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Optional additional CSS classes
   */
  className?: string;

  /**
   * Optional padding override
   * - default: 16px (design system standard)
   * - compact: 12px (tighter spacing)
   * - spacious: 24px (more breathing room)
   */
  padding?: 'default' | 'compact' | 'spacious';
}

/**
 * Card component for character/enemy status panels and generic content containers.
 *
 * Features:
 * - Full-width on mobile (responsive)
 * - 2px semantic border based on variant
 * - 12px border radius (per design system)
 * - Dark background with contrast
 *
 * @example
 * <Card variant="player">
 *   <h2>Test Fighter</h2>
 *   <StatusBar current={15} max={15} label="HP" />
 * </Card>
 *
 * @example
 * <Card variant="enemy" padding="compact">
 *   <span>Goblin - AC 10</span>
 * </Card>
 */
export function Card({
  variant,
  children,
  className = '',
  padding = 'default',
}: CardProps) {
  // Variant styles: semantic border colors
  const variantClasses = {
    player: 'border-player',
    enemy: 'border-enemy',
    neutral: 'border-border-default',
  };

  // Padding styles
  const paddingClasses = {
    default: 'p-4', // 16px
    compact: 'p-3', // 12px
    spacious: 'p-6', // 24px
  };

  return (
    <div
      className={`
        bg-secondary
        rounded-xl
        border-2
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}
