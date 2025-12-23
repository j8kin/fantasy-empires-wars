import type { Alignment } from './Alignment';
import type { EffectRules } from './Effect';

export enum TreasureType {
  // Artifacts (Heroes personal items)
  BOOTS_OF_SPEED = 'Boots of the Windstrider',
  GAUNTLETS_OF_POWER = 'Gauntlets of the Ironheart',
  AMULET_OF_PROTECTION = 'Amulet of Serenity',
  HELMET_OF_VISION = 'Helm of Insight',
  RING_OF_EXPERIENCE = 'Ring of the Ascendant',
  CLOAK_OF_DISPLACEMENT = 'Cloak of Shadows',

  // Items (Empire items which could be used like spells on Map)
  WAND_OF_TURN_UNDEAD = 'Wand of Turning',
  ORB_OF_STORM = 'Orb of Storms',
  RESTORE_BUILDING = 'Seed of Renewal',
  AEGIS_SHARD = 'Aegis Shard',
  RESURRECTION = 'Phoenix Feather',
  STONE_OF_RENEWAL = 'Stone of Renewal',
  COMPASS_OF_DOMINION = 'Compass of Dominion',
  DEED_OF_RECLAMATION = 'Deed of Reclamation',
  MERCY_OF_ORRIVANE = 'Mercy of Orrivane',
  HOURGLASS_OF_DELAY = 'Hourglass of Delay',

  // Relic items. Has a permanent effect on the game state
  MIRROR_OF_ILLUSION = 'Mirror of Illusion',
  BANNER_OF_UNITY = 'Banner of Unity',
  HEARTSTONE_OF_ORRIVANE = 'Heartstone of Orrivane',
  SHARD_OF_THE_SILENT_ANVIL = 'Shard of the Silent Anvil',
  CROWN_OF_DOMINION = 'Crown of Dominion',
  SCEPTER_OF_TEMPESTS = 'Scepter of Tempests',
  OBSIDIAN_CHALICE = 'Obsidian Chalice',
  VERDANT_IDOL = 'Verdant Idol',
  STARWELL_PRISM = 'Starwell Prism',
}

export interface Treasure {
  type: TreasureType;
  lore: string;
  description: string;
  rules?: EffectRules;
}

// Hero items
export interface Artifact {
  /** UUID */
  id: string;
  level: number;
  treasure: Treasure;
}

// Usable on Map Items
export interface Item {
  /** UUID */
  id: string;
  charge: number;
  treasure: Treasure;
}

// Items that have a permanent effect on the Game State
export interface Relic {
  /** UUID */
  id: string;
  alignment: Alignment;
  treasure: Treasure;
}

export type EmpireTreasure = Item | Relic;
