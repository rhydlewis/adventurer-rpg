import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * - primary: Blue player color (default actions)
   * - danger: Red enemy color (destructive actions)
   * - secondary: Gray neutral (secondary actions)
   */
  variant?: 'primary' | 'danger' | 'secondary';

  /**
   * Button size
   * - default: 48px height (mobile-optimized)
   * - large: 56px height (prominent actions)
   */
  size?: 'default' | 'large';

  /**
   * Whether button should take full width of container
   */
  fullWidth?: boolean;

  /**
   * Optional icon to display before text (Lucide React icon)
   */
  icon?: ReactNode;

  /**
   * Button content (text or other elements)
   */
  children: ReactNode;
}

/**
 * Button component following Adventurer RPG design system.
 *
 * Features:
 * - Minimum 44x44px tap target (WCAG AA)
 * - Visible focus ring for keyboard navigation
 * - Press animation (scale down on active)
 * - Disabled state styling
 * - Icon support with proper spacing
 *
 * @example
 * <Button variant="primary" icon={<Icon name="Swords" />}>
 *   Attack
 * </Button>
 *
 * @example
 * <Button variant="danger" size="large" fullWidth>
 *   End Combat
 * </Button>
 */
export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base styles: typography, transitions, accessibility
  const baseClasses =
    'font-inter font-semibold rounded-lg transition-all duration-200 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-primary ' +
    'disabled:opacity-50 disabled:cursor-not-allowed ' +
    'active:scale-[0.98] shadow-lg';

  // Variant styles: colors and hover states
  const variantClasses = {
    primary: 'bg-player text-white hover:bg-blue-600 active:bg-blue-700',
    danger: 'bg-enemy text-white hover:bg-red-700 active:bg-red-800',
    secondary:
      'bg-secondary text-text-primary border-2 border-border-default ' +
      'hover:border-player active:border-blue-600',
  };

  // Size styles: height and padding (min 44px tap target)
  const sizeClasses = {
    default: 'h-12 px-4 text-body min-w-[44px]', // 48px height
    large: 'h-14 px-6 text-h1 min-w-[44px]', // 56px height
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {icon && <span aria-hidden="true">{icon}</span>}
        <span>{children}</span>
      </span>
    </button>
  );
}
