import { Alignment } from './Alignment';

interface TreasureType {
  id: TreasureItem;
  description: string;
  effect: string;
}

// Hero items
export interface Artifact extends TreasureType {
  level?: number; // will be set to +1 - +5 when players gets the item todo ???
}

// Usable on Map Items the main idea is to allow non-magic players to use magic and use another magic school spells
export interface Item extends TreasureType {
  charge?: number; // will be set to 8-12 when players gets the item todo ???
}

// Items that have a permanent effect on the Game State
export interface Relic extends TreasureType {
  alignment?: Alignment; // undefined means that artifact allowed for all players
}

export type EmpireTreasure = Item | Relic;

export const isRelic = (treasure: EmpireTreasure): boolean => {
  return relicts.some((relic) => relic.id === treasure.id);
};

export enum TreasureItem {
  // Artifacts (Heroes personal items)
  BOOTS_OF_SPEED = 'Boots of the Windstrider',
  GAUNTLETS_OF_POWER = 'Gauntlets of the Ironheart',
  AMULET_OF_PROTECTION = 'Amulet of Serenity',
  HELMET_OF_VISION = 'Helm of Insight',
  RING_OF_EXPERIENCE = 'Ring of the Ascendant',
  CLOAK_OF_DISPLACEMENT = 'Cloak of Shadows',

  // Items (Empire items which could be used like spells on Map)
  WAND_TURN_UNDEAD = 'Wand of Turning',
  ORB_OF_STORM = 'Orb of Storms',
  RESTORE_BUILDING = 'Seed of Renewal',
  AEGIS_SHARD = 'Aegis Shard',
  RESURRECTION = 'Phoenix Feather',
  STONE_OF_RENEWAL = 'Stone of Renewal',
  COMPASS_OF_DOMINION = 'Compass of Dominion',
  DEED_OF_RECLAMATION = 'Deed of Reclamation',
  ORRIVANES_MERCY = 'Orrivane Mercy',
  HOURGLASS_OF_DELAY = 'Hourglass of Delay',

  // Relic items. Has permanent effect on the game state
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

export const artifacts: Artifact[] = [
  {
    id: TreasureItem.BOOTS_OF_SPEED,
    description: 'Woven from feathers of sky-born eagles, they hum with the breath of dawn itself.',
    effect: 'Increase movement speed.',
  },
  {
    id: TreasureItem.GAUNTLETS_OF_POWER,
    description: 'Forged in molten stone by dwarven ancestors, they pulse with the rhythm of war.',
    effect: 'Increase attack',
  },
  {
    id: TreasureItem.AMULET_OF_PROTECTION,
    description: 'A crystal of purest calm, reflecting peace even in the heart of battle.',
    effect: 'Increase defense',
  },
  {
    id: TreasureItem.HELMET_OF_VISION,
    description: 'Bestowed by elven seers to those deemed worthy to see what others fear.',
    effect: 'Reveals terrain in radius 2',
  },
  {
    id: TreasureItem.RING_OF_EXPERIENCE,
    description:
      'Forged from starlight that fell into mortal hands; it awakens hidden potential but hungers for ambition.',
    effect: 'Hero gains +2 levels instead of +1',
  },
  {
    id: TreasureItem.CLOAK_OF_DISPLACEMENT,
    description:
      'Crafted by unseen hands in the dark between worlds; the air bends to its wearer’s will.',
    effect: '+20% chance to evade damage',
  },
];

export const items: Item[] = [
  {
    id: TreasureItem.WAND_TURN_UNDEAD,
    description: 'Glows faintly when darkness rises, whispering the forgotten prayers of light.',
    effect: 'Turns undead on the selected land',
  },
  {
    id: TreasureItem.ORB_OF_STORM,
    description: 'Within its swirling mist sleeps the echo of a tempest god.',
    effect: 'Casts Tornado spell',
  },
  {
    id: TreasureItem.RESTORE_BUILDING,
    description: 'This seed sprouts overnight into a structure born of the world’s memory.',
    effect: 'Restores one destroyed building. Even Stronghold on neutral land is restored',
    charge: 1,
  },
  {
    id: TreasureItem.AEGIS_SHARD,
    description: 'A dormant ward that shatters the moment true harm is attempted.',
    effect: 'Negates the next hostile spell on one land',
    charge: 1,
  },
  {
    id: TreasureItem.RESURRECTION,
    description: 'Burns with immortal fire; rebirth always comes with the scent of ash.',
    effect: 'Revives a fallen hero once',
    charge: 1,
  },
  {
    id: TreasureItem.STONE_OF_RENEWAL,
    description: 'Ancient and patient, it remembers how the land once was.',
    effect: 'Removes one negative effect from a land',
    charge: 3,
  },
  {
    id: TreasureItem.COMPASS_OF_DOMINION,
    description: 'Its needle bends toward power, not north.',
    effect: 'Reveals all lands owned by one player for 2 turns',
    charge: 2,
  },
  {
    id: TreasureItem.DEED_OF_RECLAMATION,
    description: 'An ancient charter granting fleeting dominion by forgotten law.',
    effect: 'Claim a neutral land for income and mana only',
    charge: 2,
  },
  {
    id: TreasureItem.ORRIVANES_MERCY,
    description: 'When fate turns cruel, Orrivane opens a hidden path home.',
    effect: 'First hero lost on a quest instead escapes to a stronghold',
  },
  {
    id: TreasureItem.HOURGLASS_OF_DELAY,
    description: 'A timeless tool of the ancient gods; it delays the time of the world.',
    effect: 'All armies on land could not move for one turn',
    charge: 2,
  },
];

export const relicts: Relic[] = [
  {
    id: TreasureItem.MIRROR_OF_ILLUSION,
    description: 'Once owned by Selene Duskwhisper; it reflects not truth but intention.',
    effect: 'Enemy sees false army information on your land',
  },
  {
    id: TreasureItem.BANNER_OF_UNITY,
    description: 'An ancient symbol of peace that rallies hearts even in distant provinces.',
    effect: '+25% income from all lands',
  },
  // not available for non-magical players (for example, Kaer Dravane)
  {
    id: TreasureItem.HEARTSTONE_OF_ORRIVANE,
    description: 'Pulses with the rhythm of the living world — the first heartbeat of creation.',
    effect: '+1 mana from the land’s natural source for each controlled special land.',
  },
  // not available for players who use magic and recruit mages
  {
    id: TreasureItem.SHARD_OF_THE_SILENT_ANVIL,
    description:
      'Forged in defiance of the arcane, this iron shard hums with a stillness that smothers spellcraft.',
    effect: 'Reduces enemy spell damage against you by 35% and increases army morale by 10%.',
  },
  {
    id: TreasureItem.CROWN_OF_DOMINION,
    description: 'Worn by the first High King, its weight commands the land itself.',
    effect: '-15% building and recruitment cost empire-wide',
  },
  {
    id: TreasureItem.SCEPTER_OF_TEMPESTS,
    description: 'The air crackles with the echo of thunder whenever it’s raised.',
    effect: 'Increases spell damage by 25%',
  },
  {
    id: TreasureItem.OBSIDIAN_CHALICE,
    description: 'Said to be carved from a meteor; it thirsts for both power and blood.',
    effect: 'Converts 10% of income into 0.1% of black mana',
    alignment: Alignment.CHAOTIC,
  },
  {
    id: TreasureItem.VERDANT_IDOL,
    description: 'Covered in moss that never dies; druids whisper that it breathes.',
    effect: 'All Green Mana spells cost 15% less',
    alignment: Alignment.LAWFUL,
  },
  {
    id: TreasureItem.STARWELL_PRISM,
    description:
      'Said to resonate with the afterglow of the first dawn, it repeats what has once been cast.',
    effect:
      'Each offensive spell has a 15% chance to automatically repeat once its effect on a nearby enemy land.',
    alignment: Alignment.NEUTRAL,
  },
];
