import { useEffect } from 'react';
import { Icon } from '../components';

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * SplashScreen - Initial startup screen with game title and branding
 *
 * Features:
 * - Two-line title: "Adventurer" + "RPG" (larger)
 * - Placeholder icon/image
 * - Auto-advance to main menu after 2.5 seconds
 * - Tap anywhere to skip
 * - Fade-in animation
 */
export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    // Auto-advance to main menu after 2.5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 cursor-pointer animate-fade-in"
      onClick={onComplete}
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Placeholder Image/Icon */}
        <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-text-accent to-warning flex items-center justify-center shadow-2xl">
          <Icon name="Swords" size={64} className="text-primary" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-h1 heading-secondary text-fg-primary mb-2">
            Adventurer
          </h1>
          <h2 className="text-display heading-display text-fg-accent text-6xl">
            RPG
          </h2>
        </div>
      </div>

      {/* Tap to continue hint */}
      <p className="absolute bottom-8 text-fg-muted text-caption label-secondary animate-pulse">
        Tap to continue
      </p>
    </div>
  );
}
