import { TreasureType } from '../../types/Treasures';
import { EffectTarget, EffectType } from '../../types/Effect';
import type { Treasure, EmpireTreasure, Relic } from '../../types/Treasures';

export const artifacts: Treasure[] = [
  {
    type: TreasureType.BOOTS_OF_SPEED,
    lore: 'Woven from feathers of sky-born eagles, they hum with the breath of dawn itself.',
    description: 'Increase movement speed.',
  },
  {
    type: TreasureType.GAUNTLETS_OF_POWER,
    lore: 'Forged in molten stone by dwarven ancestors, they pulse with the rhythm of war.',
    description: 'Increase attack',
  },
  {
    type: TreasureType.AMULET_OF_PROTECTION,
    lore: 'A crystal of purest calm, reflecting peace even in the heart of battle.',
    description: 'Increase defense',
  },
  {
    type: TreasureType.HELMET_OF_VISION,
    lore: 'Bestowed by elven seers to those deemed worthy to see what others fear.',
    description: 'Reveals terrain in radius 2',
  },
  {
    type: TreasureType.RING_OF_EXPERIENCE,
    lore: 'Forged from starlight that fell into mortal hands; it awakens hidden potential but hungers for ambition.',
    description: 'Hero gains +2 levels instead of +1',
  },
  {
    type: TreasureType.CLOAK_OF_DISPLACEMENT,
    lore: 'Crafted by unseen hands in the dark between worlds; the air bends to its wearer’s will.',
    description: '+20% chance to evade damage',
  },
];

export const items: Treasure[] = [
  {
    type: TreasureType.WAND_TURN_UNDEAD,
    lore: 'Glows faintly when darkness rises, whispering the forgotten prayers of light.',
    description: 'Turns undead on the selected land',
  },
  {
    type: TreasureType.ORB_OF_STORM,
    lore: 'Within its swirling mist sleeps the echo of a tempest god.',
    description: 'Casts Tornado spell',
  },
  {
    type: TreasureType.RESTORE_BUILDING,
    lore: 'This seed sprouts overnight into a structure born of the world’s memory.',
    description: 'Restores one destroyed building. Even Stronghold on neutral land is restored',
  },
  {
    type: TreasureType.AEGIS_SHARD,
    lore: 'A dormant ward that shatters the moment true harm is attempted.',
    description: 'Negates the next hostile spell on one land',
    rules: {
      type: EffectType.PERMANENT,
      target: EffectTarget.LAND,
      duration: 0,
    },
  },
  {
    type: TreasureType.RESURRECTION,
    lore: 'Burns with immortal fire; rebirth always comes with the scent of ash.',
    description: 'Revives a fallen hero once',
  },
  {
    type: TreasureType.STONE_OF_RENEWAL,
    lore: 'Ancient and patient, it remembers how the land once was.',
    description: 'Removes one negative effect from a land',
  },
  {
    type: TreasureType.COMPASS_OF_DOMINION,
    lore: 'Its needle bends toward power, not north.',
    description: 'Reveals all lands owned by one player for 2 turns',
    rules: {
      type: EffectType.POSITIVE,
      target: EffectTarget.LAND,
      duration: 2,
    },
  },
  {
    type: TreasureType.DEED_OF_RECLAMATION,
    lore: 'An ancient charter granting fleeting dominion by forgotten law.',
    description: 'Claim a neutral land for income and mana only',
    rules: {
      type: EffectType.PERMANENT,
      target: EffectTarget.LAND,
      duration: 0,
    },
  },
  {
    type: TreasureType.MERCY_OF_ORRIVANE,
    lore: 'When fate turns cruel, Orrivane opens a hidden path home.',
    description: 'First hero lost on a quest instead escapes to a stronghold',
    rules: {
      type: EffectType.PERMANENT,
      target: EffectTarget.PLAYER,
      duration: 0,
    },
  },
  {
    type: TreasureType.HOURGLASS_OF_DELAY,
    lore: 'A timeless tool of the ancient gods; it delays the time of the world.',
    description: 'All armies on land could not move for one turn',
    rules: {
      type: EffectType.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 1,
    },
  },
];

export const relicts: Treasure[] = [
  {
    type: TreasureType.MIRROR_OF_ILLUSION,
    lore: 'Once owned by Selene Duskwhisper; it reflects not truth but intention.',
    description: 'Enemy sees false army information on your land',
  },
  {
    type: TreasureType.BANNER_OF_UNITY,
    lore: 'An ancient symbol of peace that rallies hearts even in distant provinces.',
    description: '+25% income from all lands',
  },
  // not available for non-magical players (for example, Kaer Dravane)
  {
    type: TreasureType.HEARTSTONE_OF_ORRIVANE,
    lore: 'Pulses with the rhythm of the living world — the first heartbeat of creation.',
    description: '+1 mana from the land’s natural source for each controlled special land.',
  },
  // not available for players who use magic and recruit mages
  {
    type: TreasureType.SHARD_OF_THE_SILENT_ANVIL,
    lore: 'Forged in defiance of the arcane, this iron shard hums with a stillness that smothers spellcraft.',
    description: 'Reduces enemy spell damage against you by 35% and increases army morale by 10%.',
  },
  {
    type: TreasureType.CROWN_OF_DOMINION,
    lore: 'Worn by the first High King, its weight commands the land itself.',
    description: '-15% building and recruitment cost empire-wide',
  },
  {
    type: TreasureType.SCEPTER_OF_TEMPESTS,
    lore: 'The air crackles with the echo of thunder whenever it’s raised.',
    description: 'Increases spell damage by 25%',
  },
  {
    type: TreasureType.OBSIDIAN_CHALICE,
    lore: 'Said to be carved from a meteor; it thirsts for both power and blood.',
    description: 'Converts 10% of income into 0.1% of black mana',
  },
  {
    type: TreasureType.VERDANT_IDOL,
    lore: 'Covered in moss that never dies; druids whisper that it breathes.',
    description: 'All Green Mana spells cost 15% less',
  },
  {
    type: TreasureType.STARWELL_PRISM,
    lore: 'Said to resonate with the afterglow of the first dawn, it repeats what has once been cast.',
    description:
      'Each offensive spell has a 15% chance to automatically repeat once its effect on a nearby enemy land.',
  },
];

/**
 * Type guard to check if a treasure is a relic
 * @param treasure - The treasure to check
 * @returns True if the treasure is a relic
 */
export const isRelic = (treasure: EmpireTreasure): treasure is Relic => {
  return relicts.some((relic) => relic.type === treasure.treasure.type);
};

export const getItem = (type: TreasureType): Treasure => {
  return items.find((item) => item.type === type)!;
};
