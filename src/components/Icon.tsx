import type { LucideProps } from 'lucide-react';
import { icons } from 'lucide-react';

interface IconProps extends LucideProps {
  name: keyof typeof icons;
}

/**
 * A dynamic and reusable Icon component that wraps lucide-react.
 * It enforces the design system's default size of 24x24px.
 *
 * @example
 * <Icon name="Swords" className="text-player" />
 * <Icon name="Heart" size={16} />
 */
const Icon = ({ name, className, ...props }: IconProps) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    // Return a fallback or null if the icon name is invalid
    return null;
  }

  // Enforce the default size from the design system, but allow overrides via props.
  const size = props.size || 24;

  return <LucideIcon size={size} className={className} {...props} />;
};

export default Icon;
