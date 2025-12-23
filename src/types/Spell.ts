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
