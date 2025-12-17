/**
 * Available character avatars
 * Images are located in /public/assets/avatars/
 */
export const AVAILABLE_AVATARS = [
  'human_male_00004.png',
  'human_female_00009.png',
  'human_female_00062.png',
  'human_male_00005.png',
  'human_male_00024.png',
] as const;

export const DEFAULT_AVATAR = AVAILABLE_AVATARS[0];

/**
 * Merchant avatars for random selection
 * Images are located in /public/assets/avatars/
 */
export const MERCHANT_AVATARS = [
  'human_male_00024.png',
  'human_female_00062.png',
  'human_male_00005.png',
] as const;
