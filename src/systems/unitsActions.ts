import { HeroState } from '../state/army/HeroState';
import { RegularsState, UnitRank } from '../state/army/RegularsState';
import { hasArtifact } from '../selectors/armySelectors';
import { unitsBaseStats } from '../domain/unit/unitRepository';
import { Alignment } from '../types/Alignment';
import { TreasureType } from '../types/Treasures';
import { HeroUnitType, MAX_HERO_LEVEL, RegularUnitType } from '../types/UnitType';

export const levelUpHero = (hero: HeroState, playerAlignment: Alignment): void => {
  if (hero.level === MAX_HERO_LEVEL) return; // hero reached max level

  if (hasArtifact(hero, TreasureType.RING_OF_EXPERIENCE)) {
    hero.level = hero.level === MAX_HERO_LEVEL - 1 ? MAX_HERO_LEVEL : hero.level + 2;
  } else {
    hero.level++;
  }

  // stat_gain = base_gain * class_factor * race_factor * alignment_factor
  // increase characteristics
  const baseHeroClass = unitsBaseStats(hero.type);
  const baseLevelUpParams = baseStatsLevelUpParameters(hero.type);
  const alignmentModifier = alignmentModifiers(playerAlignment);
  hero.baseStats.attack = Math.floor(
    baseHeroClass.attack + baseLevelUpParams.attack * alignmentModifier.attack * (hero.level - 1)
  );
  hero.baseStats.defense = Math.floor(
    baseHeroClass.defense + baseLevelUpParams.defense * alignmentModifier.defense * (hero.level - 1)
  );
  hero.baseStats.rangeDamage =
    hero.baseStats.rangeDamage && baseHeroClass.rangeDamage
      ? Math.floor(
          baseHeroClass.rangeDamage +
            baseLevelUpParams.rangeDamage * alignmentModifier.attack * (hero.level - 1)
        )
      : undefined;
  hero.baseStats.health = Math.floor(
    baseHeroClass.health + baseLevelUpParams.health * alignmentModifier.health * (hero.level - 1)
  );
  hero.mana =
    hero.mana != null
      ? Math.floor(1 + baseLevelUpParams.mana * alignmentModifier.mana * (hero.level - 1))
      : undefined;

  hero.baseStats.maintainCost = baseHeroClass.maintainCost * (Math.floor(hero.level / 4) + 1);
};

export const levelUpRegulars = (regular: RegularsState, playerAlignment: Alignment): void => {
  // Undead units can't be leveled up'
  if (regular.type === RegularUnitType.UNDEAD) return;

  if (regular.rank === UnitRank.REGULAR) {
    regular.rank = UnitRank.VETERAN;
  } else {
    regular.rank = UnitRank.ELITE;
  }
  const baseRegularStats = unitsBaseStats(regular.type);
  const baseLevelUpParams = baseStatsLevelUpParameters(regular.type);
  const alignmentModifier = alignmentModifiers(playerAlignment);
  const levelModifier = regular.rank === UnitRank.ELITE ? 7 : 3;
  regular.baseStats.attack = Math.floor(
    baseRegularStats.attack + baseLevelUpParams.attack * alignmentModifier.attack * levelModifier
  );

  regular.baseStats.defense = Math.floor(
    baseRegularStats.defense + baseLevelUpParams.defense * alignmentModifier.defense * levelModifier
  );

  regular.baseStats.rangeDamage =
    regular.baseStats.rangeDamage && baseRegularStats.rangeDamage
      ? Math.floor(
          baseRegularStats.rangeDamage +
            baseLevelUpParams.rangeDamage * alignmentModifier.attack * levelModifier
        )
      : undefined;

  regular.baseStats.health = Math.floor(
    baseRegularStats.health + baseLevelUpParams.health * alignmentModifier.health * levelModifier
  );

  if (regular.rank === UnitRank.ELITE && regular.type !== RegularUnitType.WARD_HANDS) {
    regular.baseStats.speed *= 1.5;
  }

  if (regular.rank === UnitRank.VETERAN) {
    regular.baseStats.maintainCost = baseRegularStats.maintainCost * 1.5;
  } else {
    regular.baseStats.maintainCost = baseRegularStats.maintainCost * 2;
  }
};

const baseStatsLevelUpParameters = (unitType: HeroUnitType | RegularUnitType) => {
  switch (unitType) {
    case HeroUnitType.WARSMITH:
    case RegularUnitType.ORC:
      return { attack: 2.7, defense: 0.6, health: 6, rangeDamage: 2.7, mana: 0 };
    case HeroUnitType.FIGHTER:
    case HeroUnitType.OGR:
    case HeroUnitType.HAMMER_LORD:
    case HeroUnitType.DRUID:
    case HeroUnitType.CLERIC:
    case RegularUnitType.WARRIOR:
    case RegularUnitType.DWARF:
      return { attack: 2.5, defense: 0.4, health: 5, rangeDamage: 2.5, mana: 0.5 };
    case HeroUnitType.RANGER:
    case HeroUnitType.SHADOW_BLADE:
    case RegularUnitType.HALFLING:
    case RegularUnitType.DARK_ELF:
    case RegularUnitType.ELF:
    case RegularUnitType.BALLISTA:
    case RegularUnitType.CATAPULT:
      return { attack: 0.5, defense: 0.4, health: 5, rangeDamage: 1.5, mana: 0 };
    case HeroUnitType.ENCHANTER:
      return { attack: 1.5, defense: 0.4, health: 3, rangeDamage: 0, mana: 0.8 };
    case HeroUnitType.PYROMANCER:
    case HeroUnitType.NECROMANCER:
      return { attack: 0.5, defense: 0.4, health: 2, rangeDamage: 1.8, mana: 0.5 };
    case RegularUnitType.WARD_HANDS:
      return { attack: 0.5, defense: 0.4, health: 0.8, rangeDamage: 0, mana: 0 };
    case RegularUnitType.UNDEAD:
      return { attack: 0, defense: 0, health: 0, rangeDamage: 0, mana: 0 }; // fallback for undead units, they can't be leveled up'
  }
};

const alignmentModifiers = (alignment: Alignment) => {
  switch (alignment) {
    case Alignment.LAWFUL:
      return { attack: 0.9, defense: 1.1, health: 1.1, mana: 1.0 };
    case Alignment.CHAOTIC:
      return { attack: 1.1, defense: 0.9, health: 0.9, mana: 1.1 };
    case Alignment.NEUTRAL:
      return { attack: 1.0, defense: 1.0, health: 1.0, mana: 1.0 };
    default:
      throw new Error('AlignmentModifiers: Invalid player alignment'); // should never happen
  }
};
