import { ManaKind } from './Mana';
import { EffectKind, EffectTarget } from './Effect';
import type { ManaType } from './Mana';
import type { EffectRules } from './Effect';
import type { PenaltyConfig } from '../domain/army/armyPenaltyCalculator';

// https://github.com/j8kin/fantasy-empires-wars/wiki/Magic

export const SpellName = {
  // while
  TURN_UNDEAD: 'Turn Undead',
  VIEW_TERRITORY: 'View Territory',
  BLESSING: 'Blessing Of Protection',
  HEAL: 'Heal Wounded',
  // blue
  ILLUSION: 'Veil of Misdirection',
  TELEPORT: 'Teleport',
  TORNADO: 'Tornado',
  EXCHANGE: 'Arcane Exchange',
  // green
  FERTILE_LAND: 'Fertile Lands',
  ENTANGLING_ROOTS: 'Entangling Roots',
  BEAST_ATTACK: 'Beast Attack',
  EARTHQUAKE: 'Earthquake',
  // red
  EMBER_RAID: 'Ember Raid',
  FORGE_OF_WAR: 'Forge Of War',
  FIRESTORM: 'Firestorm',
  METEOR_SHOWER: 'Meteor Shower',
  // black
  CORRUPTION: 'Corruption',
  RAISE_DEAD_HERO: 'Raise Dead Hero',
  SUMMON_UNDEAD: 'Summon Undead',
  PLAGUE: 'Plague',
} as const;

export type SpellType = (typeof SpellName)[keyof typeof SpellName];

export const SpellTarget = {
  PLAYER: 'player',
  OPPONENT: 'opponent',
  ALL: 'all',
} as const;

export type SpellTargetType = (typeof SpellTarget)[keyof typeof SpellTarget];

export interface Spell {
  id: SpellType;
  description: string;
  manaCost: number;
  manaType: ManaType;
  apply: SpellTargetType;
  rules?: EffectRules;
  penalty?: PenaltyConfig;
}

const generatePenaltyConfig = (
  minPct: number,
  maxPct: number,
  minAbs: number,
  maxAbs: number
): PenaltyConfig => ({
  regular: { minPct: minPct, maxPct: maxPct, minAbs: minAbs, maxAbs: maxAbs },
  veteran: { minPct: minPct / 2, maxPct: maxPct / 2, minAbs: minAbs / 2, maxAbs: maxAbs / 2 },
  elite: { minPct: minPct / 4, maxPct: maxPct / 4, minAbs: minAbs / 4, maxAbs: minAbs / 4 },
});

const WhiteMagicSpells: Spell[] = [
  {
    id: SpellName.TURN_UNDEAD,
    description: 'Turns undead on the selected land',
    manaCost: 0,
    apply: SpellTarget.OPPONENT,
    manaType: ManaKind.WHITE,
    rules: {
      type: EffectKind.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 1, // this spell apply to player and not allow to cast it more then once on the same player on the same turn
    },
    penalty: generatePenaltyConfig(0, 0, 40, 60),
  },
  {
    id: SpellName.VIEW_TERRITORY,
    description: "Reveals information about an opponent's territory",
    manaCost: 25,
    apply: SpellTarget.OPPONENT,
    manaType: ManaKind.WHITE,
    rules: {
      type: EffectKind.POSITIVE,
      target: EffectTarget.LAND,
      duration: 1,
    },
  },
  {
    id: SpellName.BLESSING,
    description: 'Increases defense of all units on a territory for 3 turns (+20%)',
    manaCost: 40,
    apply: SpellTarget.PLAYER, // todo: probably both to be able cast on ally
    manaType: ManaKind.WHITE,
    rules: {
      type: EffectKind.POSITIVE,
      target: EffectTarget.LAND,
      duration: 3,
    },
  },
  {
    id: SpellName.HEAL,
    description: 'Restores 20–30% of lost units after battle (cannot resurrect heroes)',
    manaCost: 60,
    apply: SpellTarget.PLAYER, // todo: probably both to be able cast on ally
    manaType: ManaKind.WHITE,
    rules: {
      type: EffectKind.POSITIVE,
      target: EffectTarget.LAND,
      duration: 0, // effect applies immediately and not stored in the effect stack
    },
  },
];

const BlueMagicSpells: Spell[] = [
  {
    id: SpellName.ILLUSION,
    description: 'Temporarily conceals territory information in and around the targeted land.',
    manaCost: 25,
    apply: SpellTarget.PLAYER,
    manaType: ManaKind.BLUE,
    rules: {
      type: EffectKind.POSITIVE,
      target: EffectTarget.LAND,
      duration: 3,
    },
  },
  {
    id: SpellName.TELEPORT,
    description: 'Instantly move one army to a friendly stronghold',
    manaCost: 45,
    apply: SpellTarget.PLAYER,
    manaType: ManaKind.BLUE,
    rules: {
      type: EffectKind.POSITIVE,
      target: EffectTarget.ARMY,
      duration: 0, // this means that effect applies immediately and not stored in the effect stack
    },
  },
  {
    id: SpellName.TORNADO,
    description: 'Kills 20–35% of all troops (heroes may be killed based on level)',
    manaCost: 50,
    apply: SpellTarget.OPPONENT,
    manaType: ManaKind.BLUE,
    rules: {
      type: EffectKind.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 0, // effect applies immediately and not stored in the effect stack
    },
    penalty: generatePenaltyConfig(0.2, 0.35, 5, 5),
  },
  {
    id: SpellName.EXCHANGE,
    description: 'Exchange 100 Blue mana into another mana source with penalty',
    manaCost: 100,
    apply: SpellTarget.PLAYER,
    manaType: ManaKind.BLUE,
  },
];

const GreenMagicSpells: Spell[] = [
  {
    id: SpellName.FERTILE_LAND,
    description: 'Increase gold production on lands in radius 1 by +50% for 2 turns',
    manaCost: 40,
    apply: SpellTarget.PLAYER,
    manaType: ManaKind.GREEN,
    rules: {
      type: EffectKind.POSITIVE,
      target: EffectTarget.LAND,
      duration: 2,
    },
  },
  {
    id: SpellName.ENTANGLING_ROOTS,
    description: 'Enemy army on a territory cannot move for 1 turn',
    manaCost: 60,
    apply: SpellTarget.OPPONENT,
    manaType: ManaKind.GREEN,
    rules: {
      type: EffectKind.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 1,
    },
  },
  {
    id: SpellName.BEAST_ATTACK,
    description: 'Kills 15–25% of all troops (heroes may be killed based on level)',
    manaCost: 70,
    apply: SpellTarget.OPPONENT,
    manaType: ManaKind.GREEN,
    rules: {
      type: EffectKind.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 0, // effect applies immediately and not stored in the effect stack
    },
    penalty: generatePenaltyConfig(0.15, 0.25, 5, 5),
  },
  {
    id: SpellName.EARTHQUAKE,
    description:
      'Kills 10–20% of all troops, 40% chance to destroy a building (heroes may be killed based on level)',
    manaCost: 100,
    apply: SpellTarget.OPPONENT,
    manaType: ManaKind.GREEN,
    rules: {
      type: EffectKind.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 0, // effect applies immediately and not stored in the effect stack
    },
    penalty: generatePenaltyConfig(0.1, 0.2, 5, 5),
  },
];

const RedMagicSpells: Spell[] = [
  {
    id: SpellName.EMBER_RAID,
    description:
      'Sabotages enemy recruitment: adds +1 turn to ongoing unit training and prevents repeated casting on the same territory for 3 turns.',
    manaCost: 30,
    apply: SpellTarget.OPPONENT,
    manaType: ManaKind.RED,
    rules: {
      type: EffectKind.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 3,
    },
  },
  {
    id: SpellName.FORGE_OF_WAR,
    description: 'Instantly recruits pack of uniq unit type available in a territory',
    manaCost: 50,
    apply: SpellTarget.PLAYER,
    manaType: ManaKind.RED,
  },
  {
    id: SpellName.FIRESTORM,
    description: 'Damages units in radius 1 lands at once (15–20% each)',
    manaCost: 100,
    apply: SpellTarget.OPPONENT,
    manaType: ManaKind.RED,
    rules: {
      type: EffectKind.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 0, // effect applies immediately and not stored in the effect stack
    },
    penalty: generatePenaltyConfig(0.15, 0.2, 5, 5),
  },
  {
    id: SpellName.METEOR_SHOWER,
    description:
      'Kills 35–45% of all troops, 50% chance to destroy a building (heroes may be killed based on level)',
    manaCost: 150,
    apply: SpellTarget.OPPONENT,
    manaType: ManaKind.RED,
    rules: {
      type: EffectKind.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 0, // effect applies immediately and not stored in the effect stack
    },
    penalty: generatePenaltyConfig(0.35, 0.45, 20, 20),
  },
];

const BlackMagicSpells: Spell[] = [
  {
    id: SpellName.SUMMON_UNDEAD,
    description: 'Summons 30–60 undead troops depending on maximum Necromancer level',
    manaCost: 25,
    apply: SpellTarget.PLAYER,
    manaType: ManaKind.BLACK,
  },
  {
    id: SpellName.PLAGUE,
    description: 'Kills 25–40% of all troops (heroes may be killed based on level)',
    manaCost: 75,
    apply: SpellTarget.OPPONENT,
    manaType: ManaKind.BLACK,
    rules: {
      type: EffectKind.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 0, // effect applies immediately and not stored in the effect stack
    },
    penalty: generatePenaltyConfig(0.25, 0.4, 5, 5),
  },
  {
    id: SpellName.RAISE_DEAD_HERO,
    description:
      'Revives fallen in battle or by magic Heroes as an Undead Hero (loses original alignment)',
    manaCost: 100,
    apply: SpellTarget.PLAYER,
    manaType: ManaKind.BLACK,
  },
  {
    id: SpellName.CORRUPTION,
    description:
      'Converts neutral land into chaotic land (if no stronghold present, only 6 lands per game)',
    manaCost: 150,
    apply: SpellTarget.ALL,
    manaType: ManaKind.BLACK,
    rules: {
      type: EffectKind.NEGATIVE,
      target: EffectTarget.LAND,
      duration: 0, // effect applies immediately and not stored in the effect stack
    },
  },
];

export const AllSpells: Spell[] = [
  ...WhiteMagicSpells,
  ...BlueMagicSpells,
  ...GreenMagicSpells,
  ...RedMagicSpells,
  ...BlackMagicSpells,
];
