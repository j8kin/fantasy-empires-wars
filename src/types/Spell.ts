import { ManaType } from './Mana';

// https://github.com/j8kin/fantasy-empires-wars/wiki/Magic

export enum SpellName {
  // while
  TURN_UNDEAD = 'Turn Undead',
  VIEW_TERRITORY = 'View Territory',
  BLESSING = 'Blessing Of Protection',
  HEAL = 'Heal Wounded',
  // blue
  ILLUSION = 'Illusion Army',
  TELEPORT = 'Teleport',
  TORNADO = 'Tornado',
  // green
  FERTILE_LAND = 'Fertile Lands',
  ENTANGLING_ROOTS = 'Entangling Roots',
  BEAST_ATTACK = 'Beast Attack',
  EARTHQUAKE = 'Earthquake',
  // red
  EMBER_RAID = 'Ember Raid',
  FORGE_OF_WAR = 'Forge Of War',
  FIRESTORM = 'Firestorm',
  METEOR_SHOWER = 'Meteor Shower',
  // black
  CORRUPTION = 'Corruption',
  RAISE_DEAD_HERO = 'Raise Dead Hero',
  SUMMON_UNDEAD = 'Summon Undead',
  PLAGUE = 'Plague',
}

export interface Spell {
  id: SpellName;
  description: string;
  manaCost: number;
  manaType: ManaType;
  apply: 'player' | 'opponent' | 'both';
}

const WhiteMagicSpells: Spell[] = [
  {
    id: SpellName.TURN_UNDEAD,
    description: 'Turns undead on the selected land',
    manaCost: 0,
    apply: 'opponent',
    manaType: ManaType.WHITE,
  },
  {
    id: SpellName.VIEW_TERRITORY,
    description: "Reveals information about an opponent's territory",
    manaCost: 25,
    apply: 'opponent',
    manaType: ManaType.WHITE,
  },
  {
    id: SpellName.BLESSING,
    description: 'Increases defense of all units on a territory for 2 turns (+20%)',
    manaCost: 40,
    apply: 'player', // todo: probably both to be able cast on ally
    manaType: ManaType.WHITE,
  },
  {
    id: SpellName.HEAL,
    description: 'Restores 20–30% of lost units after battle (cannot resurrect heroes)',
    manaCost: 60,
    apply: 'player', // todo: probably both to be able cast on ally
    manaType: ManaType.WHITE,
  },
];

const BlueMagicSpells: Spell[] = [
  {
    id: SpellName.ILLUSION,
    description: 'Creates fake army markers on the map for 3 turns (disappear if attacked)',
    manaCost: 25,
    apply: 'player',
    manaType: ManaType.BLUE,
  },
  {
    id: SpellName.TELEPORT,
    description: 'Instantly move one army to a friendly stronghold',
    manaCost: 100,
    apply: 'player',
    manaType: ManaType.BLUE,
  },
  {
    id: SpellName.TORNADO,
    description: 'Kills 20–35% of all troops (heroes may be killed based on level)',
    manaCost: 50,
    apply: 'opponent',
    manaType: ManaType.BLUE,
  },
];

const GreenMagicSpells: Spell[] = [
  {
    id: SpellName.FERTILE_LAND,
    description: 'Increase gold production on lands in radius 1 by +50% for 2 turns',
    manaCost: 40,
    apply: 'player',
    manaType: ManaType.GREEN,
  },
  {
    id: SpellName.ENTANGLING_ROOTS,
    description: 'Enemy army on a territory cannot move for 1 turn',
    manaCost: 100,
    apply: 'opponent',
    manaType: ManaType.GREEN,
  },
  {
    id: SpellName.BEAST_ATTACK,
    description: 'Kills 15–25% of all troops (heroes may be killed based on level)',
    manaCost: 70,
    apply: 'opponent',
    manaType: ManaType.GREEN,
  },
  {
    id: SpellName.EARTHQUAKE,
    description:
      'Kills 10–20% of all troops, 40% chance to destroy a building (heroes may be killed based on level)',
    manaCost: 100,
    apply: 'opponent',
    manaType: ManaType.GREEN,
  },
];

const RedMagicSpells: Spell[] = [
  {
    id: SpellName.EMBER_RAID,
    description:
      'Sabotages enemy recruitment: adds +1 turn to ongoing unit training and prevents repeated casting on the same territory for 3 turns.',
    manaCost: 30,
    apply: 'opponent',
    manaType: ManaType.RED,
  },
  {
    id: SpellName.FORGE_OF_WAR,
    description: 'Instantly recruits +33% of one unit type available in a territory with Barracks',
    manaCost: 80,
    apply: 'player',
    manaType: ManaType.RED,
  },
  {
    id: SpellName.FIRESTORM,
    description: 'Damages units in radius 1 lands at once (15–20% each)',
    manaCost: 100,
    apply: 'opponent',
    manaType: ManaType.RED,
  },
  {
    id: SpellName.METEOR_SHOWER,
    description:
      'Kills 35–45% of all troops, 50% chance to destroy a building (heroes may be killed based on level)',
    manaCost: 200,
    apply: 'opponent',
    manaType: ManaType.RED,
  },
];

const BlackMagicSpells: Spell[] = [
  {
    id: SpellName.CORRUPTION,
    description:
      'Converts neutral land into chaotic land (if no stronghold present, only 6 lands per game)',
    manaCost: 200,
    apply: 'both',
    manaType: ManaType.BLACK,
  },
  {
    id: SpellName.RAISE_DEAD_HERO,
    description: 'Revives one fallen Hero as an Undead Hero (loses original alignment)',
    manaCost: 150,
    apply: 'player',
    manaType: ManaType.BLACK,
  },
  {
    id: SpellName.SUMMON_UNDEAD,
    description: 'Summons 30–60 undead troops depending on maximum Necromancer level',
    manaCost: 25,
    apply: 'player',
    manaType: ManaType.BLACK,
  },
  {
    id: SpellName.PLAGUE,
    description: 'Kills 25–40% of all troops (heroes may be killed based on level)',
    manaCost: 75,
    apply: 'opponent',
    manaType: ManaType.BLACK,
  },
];

export const AllSpells: Spell[] = [
  ...WhiteMagicSpells,
  ...BlueMagicSpells,
  ...GreenMagicSpells,
  ...RedMagicSpells,
  ...BlackMagicSpells,
];
