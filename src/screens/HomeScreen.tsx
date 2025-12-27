import { BackButton, Button, Icon } from '../components';

interface HomeScreenProps {
  onStartStory?: () => void;
  onBack?: () => void;
}

export function HomeScreen({ onStartStory, onBack }: HomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-fg-primary p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        {onBack && (
          <div className="mb-8">
            <BackButton onBack={onBack} />
          </div>
        )}

        <div className="text-center">
          {/* Title Section */}
          <h1 className="heading-display text-[32px] leading-[1.2] mb-2 text-fg-accent">
            Adventurer RPG
          </h1>
          <p className="body-narrative text-[16px] text-fg-primary/80 mb-8">
            A single-player narrative RPG with streamlined d20 mechanics
          </p>

          {/* Main Actions */}
          {onStartStory && (
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={onStartStory}
              icon={<Icon name="Book" />}
            >
              Load Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
