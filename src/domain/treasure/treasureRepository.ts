import { Treasure, TreasureType, EmpireTreasure, Relic } from '../../types/Treasures';

export const artifacts: Treasure[] = [
  {
    type: TreasureType.BOOTS_OF_SPEED,
    description: 'Woven from feathers of sky-born eagles, they hum with the breath of dawn itself.',
    effect: 'Increase movement speed.',
  },
  {
    type: TreasureType.GAUNTLETS_OF_POWER,
    description: 'Forged in molten stone by dwarven ancestors, they pulse with the rhythm of war.',
    effect: 'Increase attack',
  },
  {
    type: TreasureType.AMULET_OF_PROTECTION,
    description: 'A crystal of purest calm, reflecting peace even in the heart of battle.',
    effect: 'Increase defense',
  },
  {
    type: TreasureType.HELMET_OF_VISION,
    description: 'Bestowed by elven seers to those deemed worthy to see what others fear.',
    effect: 'Reveals terrain in radius 2',
  },
  {
    type: TreasureType.RING_OF_EXPERIENCE,
    description:
      'Forged from starlight that fell into mortal hands; it awakens hidden potential but hungers for ambition.',
    effect: 'Hero gains +2 levels instead of +1',
  },
  {
    type: TreasureType.CLOAK_OF_DISPLACEMENT,
    description:
      'Crafted by unseen hands in the dark between worlds; the air bends to its wearer’s will.',
    effect: '+20% chance to evade damage',
  },
];

export const items: Treasure[] = [
  {
    type: TreasureType.WAND_TURN_UNDEAD,
    description: 'Glows faintly when darkness rises, whispering the forgotten prayers of light.',
    effect: 'Turns undead on the selected land',
  },
  {
    type: TreasureType.ORB_OF_STORM,
    description: 'Within its swirling mist sleeps the echo of a tempest god.',
    effect: 'Casts Tornado spell',
  },
  {
    type: TreasureType.RESTORE_BUILDING,
    description: 'This seed sprouts overnight into a structure born of the world’s memory.',
    effect: 'Restores one destroyed building. Even Stronghold on neutral land is restored',
  },
  {
    type: TreasureType.AEGIS_SHARD,
    description: 'A dormant ward that shatters the moment true harm is attempted.',
    effect: 'Negates the next hostile spell on one land',
  },
  {
    type: TreasureType.RESURRECTION,
    description: 'Burns with immortal fire; rebirth always comes with the scent of ash.',
    effect: 'Revives a fallen hero once',
  },
  {
    type: TreasureType.STONE_OF_RENEWAL,
    description: 'Ancient and patient, it remembers how the land once was.',
    effect: 'Removes one negative effect from a land',
  },
  {
    type: TreasureType.COMPASS_OF_DOMINION,
    description: 'Its needle bends toward power, not north.',
    effect: 'Reveals all lands owned by one player for 2 turns',
  },
  {
    type: TreasureType.DEED_OF_RECLAMATION,
    description: 'An ancient charter granting fleeting dominion by forgotten law.',
    effect: 'Claim a neutral land for income and mana only',
  },
  {
    type: TreasureType.MERCY_OF_ORRIVANE,
    description: 'When fate turns cruel, Orrivane opens a hidden path home.',
    effect: 'First hero lost on a quest instead escapes to a stronghold',
  },
  {
    type: TreasureType.HOURGLASS_OF_DELAY,
    description: 'A timeless tool of the ancient gods; it delays the time of the world.',
    effect: 'All armies on land could not move for one turn',
  },
];

export const relicts: Treasure[] = [
  {
    type: TreasureType.MIRROR_OF_ILLUSION,
    description: 'Once owned by Selene Duskwhisper; it reflects not truth but intention.',
    effect: 'Enemy sees false army information on your land',
  },
  {
    type: TreasureType.BANNER_OF_UNITY,
    description: 'An ancient symbol of peace that rallies hearts even in distant provinces.',
    effect: '+25% income from all lands',
  },
  // not available for non-magical players (for example, Kaer Dravane)
  {
    type: TreasureType.HEARTSTONE_OF_ORRIVANE,
    description: 'Pulses with the rhythm of the living world — the first heartbeat of creation.',
    effect: '+1 mana from the land’s natural source for each controlled special land.',
  },
  // not available for players who use magic and recruit mages
  {
    type: TreasureType.SHARD_OF_THE_SILENT_ANVIL,
    description:
      'Forged in defiance of the arcane, this iron shard hums with a stillness that smothers spellcraft.',
    effect: 'Reduces enemy spell damage against you by 35% and increases army morale by 10%.',
  },
  {
    type: TreasureType.CROWN_OF_DOMINION,
    description: 'Worn by the first High King, its weight commands the land itself.',
    effect: '-15% building and recruitment cost empire-wide',
  },
  {
    type: TreasureType.SCEPTER_OF_TEMPESTS,
    description: 'The air crackles with the echo of thunder whenever it’s raised.',
    effect: 'Increases spell damage by 25%',
  },
  {
    type: TreasureType.OBSIDIAN_CHALICE,
    description: 'Said to be carved from a meteor; it thirsts for both power and blood.',
    effect: 'Converts 10% of income into 0.1% of black mana',
    //alignment: Alignment.CHAOTIC,
  },
  {
    type: TreasureType.VERDANT_IDOL,
    description: 'Covered in moss that never dies; druids whisper that it breathes.',
    effect: 'All Green Mana spells cost 15% less',
    //alignment: Alignment.LAWFUL,
  },
  {
    type: TreasureType.STARWELL_PRISM,
    description:
      'Said to resonate with the afterglow of the first dawn, it repeats what has once been cast.',
    effect:
      'Each offensive spell has a 15% chance to automatically repeat once its effect on a nearby enemy land.',
    //alignment: Alignment.NEUTRAL,
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
