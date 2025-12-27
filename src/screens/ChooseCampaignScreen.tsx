import { BackButton, Card, Button, Icon } from '../components';
import type { Campaign } from '../types';

interface ChooseCampaignScreenProps {
  /**
   * Available campaigns to display
   */
  campaigns: Campaign[];
  
  /**
   * Callback when a campaign is selected
   */
  onSelectCampaign: (campaign: Campaign) => void;
  
  /**
   * Callback to go back to previous screen
   */
  onBack?: () => void;
}

/**
 * Campaign selection screen that displays all available campaigns
 * 
 * Features:
 * - List of campaign cards with title and description
 * - Load button for each campaign
 * - Back button to return to previous screen
 * 
 * @example
 * <ChooseCampaignScreen 
 *   campaigns={availableCampaigns}
 *   onSelectCampaign={(campaign) => loadAndStartCampaign(campaign)}
 *   onBack={() => setScreen('home')}
 * />
 */
export function ChooseCampaignScreen({ 
  campaigns, 
  onSelectCampaign, 
  onBack 
}: ChooseCampaignScreenProps) {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-primary text-fg-primary p-4 pt-8">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        {onBack && (
          <div className="mb-4">
            <BackButton onBack={onBack} />
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="heading-display text-[28px] text-fg-accent">
            Choose Campaign
          </h1>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-4" variant="neutral">
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="heading-card text-[20px] text-fg-accent mb-1">
                    {campaign.title}
                  </h3>
                  <p className="body-card text-[14px] text-fg-primary/80">
                    {campaign.description}
                  </p>
                </div>
                
                {/* Companion info */}
                <div className="flex items-center gap-2 text-sm text-fg-primary/70">
                  <Icon name="Handshake" className="w-4 h-4" />
                  <span>
                    Companion: {campaign.companionName} - {campaign.companionDescription}
                  </span>
                </div>
                
                {/* Act count */}
                <div className="flex items-center gap-2 text-sm text-fg-primary/70">
                  <Icon name="Book" className="w-4 h-4" />
                  <span>
                    {campaign.acts.length} {campaign.acts.length === 1 ? 'Act' : 'Acts'}
                  </span>
                </div>
                
                {/* Load Campaign Button */}
                <Button
                  variant="primary"
                  size="default"
                  fullWidth
                  onClick={() => onSelectCampaign(campaign)}
                  icon={<Icon name="Play" />}
                >
                  Load Campaign
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
