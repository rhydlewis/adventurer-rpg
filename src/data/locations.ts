import type { Location } from '../types/narrative';

export const LOCATIONS: Record<string, Location> = {
  'rusty-tavern': {
    id: 'rusty-tavern',
    name: 'The Rusty Tavern',
    image: 'card_location_exterior_00015.png',
    ambience: 'The air is thick with pipe smoke and the smell of ale',
    description: 'A weathered establishment on the edge of town',
  },
  'town-square': {
    id: 'town-square',
    name: 'Town Square',
    image: 'card_location_exterior_00020.png',
    ambience: 'Merchants call out their wares as townsfolk hurry about their business',
    description: 'The bustling heart of the settlement',
  },
  'forest-path': {
    id: 'forest-path',
    name: 'Forest Path',
    image: 'card_location_exterior_00035.png',
    ambience: 'Ancient trees loom overhead, their branches filtering the sunlight',
    description: 'A winding trail through dense woodland',
  },
  'crossroads': {
    id: 'crossroads',
    name: 'The Crossroads',
    image: 'card_location_signpost.png',
    ambience: 'The Crossroads - Where your journey begins',
    description: 'A weathered signpost marks the intersection of three paths',
  },
  'bandit-camp': {
    id: 'bandit-camp',
    name: 'The Bandit Camp',
    image: 'card_location_camp.jpg',
    ambience: 'A crude camp in a forest clearing, abandoned and eerily quiet',
    description: 'Makeshift tents and dying embers mark this temporary refuge',
  },
} as const;

export const LOCATION_IDS = Object.keys(LOCATIONS) as Array<keyof typeof LOCATIONS>;
