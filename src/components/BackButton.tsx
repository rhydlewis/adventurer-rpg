import Icon from './Icon';

interface BackButtonProps {
  onBack: () => void;
  label?: string;
}

/**
 * Reusable back button component for navigation.
 * Positioned in top-left corner of screens for consistency.
 */
export function BackButton({ onBack, label = 'Back' }: BackButtonProps) {
  return (
    <button
      onClick={onBack}
      className="button-text flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border-primary hover:border-fg-muted transition-all text-fg-primary"
      aria-label="Go back"
    >
      <Icon name="ArrowLeft" size={18} />
      <span>{label}</span>
    </button>
  );
}
