import { hasArtifact } from '../selectors/armySelectors';
import { getRecruitInfo, unitsBaseCombatStats } from '../domain/unit/unitRepository';
import { HeroUnitName, MAX_HERO_LEVEL, RegularUnitName } from '../types/UnitType';
import { UnitRank } from '../state/army/RegularsState';
import { Alignment } from '../types/Alignment';
import { TreasureName } from '../types/Treasures';
import { Doctrine } from '../state/player/PlayerProfile';
import type { HeroState } from '../state/army/HeroState';
import type { RegularsState } from '../state/army/RegularsState';
import type { HeroUnitType, RegularUnitType } from '../types/UnitType';
import type { AlignmentType } from '../types/Alignment';
import type { PlayerState } from '../state/player/PlayerState';

export const levelUpHero = (hero: HeroState, playerAlignment: AlignmentType): void => {
  if (hero.level === MAX_HERO_LEVEL) return; // hero reached max level

  if (hasArtifact(hero, TreasureName.RING_OF_EXPERIENCE)) {
    hero.level = hero.level === MAX_HERO_LEVEL - 1 ? MAX_HERO_LEVEL : hero.level + 2;
  } else {
    hero.level++;
  }

  // stat_gain = base_gain * class_factor * race_factor * alignment_factor
  // increase characteristics
  const baseHeroClass = unitsBaseCombatStats(hero.type);
  const baseLevelUpParams = baseStatsLevelUpParameters(hero.type);
  const alignmentModifier = alignmentModifiers(playerAlignment);
  hero.combatStats.attack = Math.floor(
    baseHeroClass.attack + baseLevelUpParams.attack * alignmentModifier.attack * (hero.level - 1)
  );
  hero.combatStats.defense = Math.floor(
    baseHeroClass.defense + baseLevelUpParams.defense * alignmentModifier.defense * (hero.level - 1)
  );
  hero.combatStats.rangeDamage =
    hero.combatStats.rangeDamage && baseHeroClass.rangeDamage
      ? Math.floor(
          baseHeroClass.rangeDamage +
            baseLevelUpParams.rangeDamage * alignmentModifier.attack * (hero.level - 1)
        )
      : undefined;
  hero.combatStats.health = Math.floor(
    baseHeroClass.health + baseLevelUpParams.health * alignmentModifier.health * (hero.level - 1)
  );
  hero.mana =
    hero.mana != null
      ? Math.floor(1 + baseLevelUpParams.mana * alignmentModifier.mana * (hero.level - 1))
      : undefined;

  hero.cost = getRecruitInfo(hero.type).maintainCost * (Math.floor(hero.level / 4) + 1);
};

export const levelUpRegulars = (regular: RegularsState, player: PlayerState): void => {
  // Undead units can't be leveled up'
  if (regular.type === RegularUnitName.UNDEAD) return;
  // Nullwarden units recruited as veteran and never promoted
  if (regular.rank === UnitRank.VETERAN && player.playerProfile.doctrine === Doctrine.NULLWARDEN)
    return;

  if (regular.rank === UnitRank.REGULAR) {
    regular.rank = UnitRank.VETERAN;
  } else {
    regular.rank = UnitRank.ELITE;
  }
  const baseRegularStats = unitsBaseCombatStats(regular.type);
  const baseLevelUpParams = baseStatsLevelUpParameters(regular.type);
  const alignmentModifier = alignmentModifiers(player.playerProfile.alignment);
  const levelModifier = regular.rank === UnitRank.ELITE ? 7 : 3;
  regular.combatStats.attack = Math.floor(
    baseRegularStats.attack + baseLevelUpParams.attack * alignmentModifier.attack * levelModifier
  );

  regular.combatStats.defense = Math.floor(
    baseRegularStats.defense + baseLevelUpParams.defense * alignmentModifier.defense * levelModifier
  );

  regular.combatStats.rangeDamage =
    regular.combatStats.rangeDamage && baseRegularStats.rangeDamage
      ? Math.floor(
          baseRegularStats.rangeDamage +
            baseLevelUpParams.rangeDamage * alignmentModifier.attack * levelModifier
        )
      : undefined;

  regular.combatStats.health = Math.floor(
    baseRegularStats.health + baseLevelUpParams.health * alignmentModifier.health * levelModifier
  );

  if (regular.rank === UnitRank.ELITE && regular.type !== RegularUnitName.WARD_HANDS) {
    regular.combatStats.speed *= 1.5;
  }

  regular.cost =
    getRecruitInfo(regular.type).maintainCost * (regular.rank === UnitRank.VETERAN ? 1.5 : 2);
};

const baseStatsLevelUpParameters = (unitType: HeroUnitType | RegularUnitType) => {
  switch (unitType) {
    case HeroUnitName.WARSMITH:
    case HeroUnitName.ZEALOT:
    case RegularUnitName.ORC:
      return { attack: 2.7, defense: 0.6, health: 6, rangeDamage: 2.7, mana: 0 };
    case HeroUnitName.FIGHTER:
    case HeroUnitName.OGR:
    case HeroUnitName.HAMMER_LORD:
    case HeroUnitName.DRUID:
    case HeroUnitName.CLERIC:
    case RegularUnitName.WARRIOR:
    case RegularUnitName.DWARF:
      return { attack: 2.5, defense: 0.4, health: 5, rangeDamage: 2.5, mana: 0.5 };
    case HeroUnitName.RANGER:
    case HeroUnitName.SHADOW_BLADE:
    case RegularUnitName.HALFLING:
    case RegularUnitName.DARK_ELF:
    case RegularUnitName.ELF:
    case HeroUnitName.ENCHANTER:
      return { attack: 1.5, defense: 0.4, health: 3, rangeDamage: 0, mana: 0.8 };
    case HeroUnitName.PYROMANCER:
    case HeroUnitName.NECROMANCER:
      return { attack: 0.5, defense: 0.4, health: 2, rangeDamage: 1.8, mana: 0.5 };
    case RegularUnitName.WARD_HANDS:
      return { attack: 0.5, defense: 0.4, health: 0.8, rangeDamage: 0, mana: 0 };
    case RegularUnitName.UNDEAD:
      return { attack: 0, defense: 0, health: 0, rangeDamage: 0, mana: 0 }; // they can't be leveled up'
  }
};

const alignmentModifiers = (alignment: AlignmentType) => {
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
