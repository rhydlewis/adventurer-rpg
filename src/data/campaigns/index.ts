/**
 * Campaigns Index - Centralized export of all available campaigns
 * 
 * This file provides a single import point for all campaigns in the game,
 * making it easy to add new campaigns and have them automatically appear
 * in the campaign selection screen.
 */

import { testCampaign } from './test-campaign';
import { validationCampaign } from './validation-campaign';
import { singleNodeCampaign } from './single-node-campaign'

// Export all available campaigns
// Add new campaigns to this array to make them selectable in-game
export const availableCampaigns = [
  validationCampaign,
  testCampaign,
  singleNodeCampaign
];

// Export individual campaigns for direct use (e.g., in tests)
export { testCampaign, validationCampaign, singleNodeCampaign };
