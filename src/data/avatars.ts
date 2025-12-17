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
 * Images are located in /public/assets/merchants/
 */
export const MERCHANT_AVATARS = [
  'dwarf_halfling_female_00009.png',
  'dwarf_halfling_male_00001.png',
  'elf_female_00013.png',
  'elf_male_00021.png',
  'human_female_00012.png',
  'human_male_00001.png',
] as const;
