import { hasArtifact } from '../selectors/armySelectors';
import { getRecruitInfo, unitsBaseCombatStats } from '../domain/unit/unitRepository';
import { Doctrine } from '../state/player/PlayerProfile';
import { HeroUnitName, MAX_HERO_LEVEL, RegularUnitName } from '../types/UnitType';
import { UnitRank } from '../state/army/RegularsState';
import { TreasureName } from '../types/Treasures';
import type { DoctrineType } from '../state/player/PlayerProfile';
import type { HeroState } from '../state/army/HeroState';
import type { RegularsState } from '../state/army/RegularsState';
import type { HeroUnitType, RegularUnitType } from '../types/UnitType';
import type { CombatStats } from '../types/CombatStats';

interface LevelUpParams extends CombatStats {
  mana?: number;
}

const levelCurve = (level: number): number => 1 + Math.log(level) * level * 0.3;

const calculateUpdatedStats = (
  baseStats: CombatStats,
  levelCurveModifier: number,
  multipliers: LevelUpParams,
  doctrine: LevelUpParams,
  currentStats: CombatStats,
  currentMana?: number
): LevelUpParams => {
  const statsToUpdate: (keyof CombatStats)[] = Object.keys(baseStats) as (keyof CombatStats)[];
  const updatedCombatStats = { ...currentStats };

  statsToUpdate.forEach((key) => {
    const base = baseStats[key];
    const mult = multipliers[key];
    // Range damage usually uses attack doctrine multiplier based on your original code
    const doc = key === 'rangeDamage' ? doctrine.attack : doctrine[key as keyof LevelUpParams];

    if (base !== undefined && mult !== undefined && currentStats[key] !== undefined) {
      (updatedCombatStats[key] as number) = Math.floor(
        base + (key !== 'speed' ? levelCurveModifier : 1.0) * mult * (doc as number)
      );
    }
  });

  const updatedMana =
    currentMana !== undefined
      ? Math.floor(1 + levelCurveModifier * multipliers.mana! * doctrine.mana!)
      : undefined;

  return { ...updatedCombatStats, mana: updatedMana };
};

export const levelUpHero = (hero: HeroState, doctrine: DoctrineType): void => {
  if (hero.level === MAX_HERO_LEVEL) return;

  if (hasArtifact(hero, TreasureName.RING_OF_EXPERIENCE)) {
    hero.level = hero.level === MAX_HERO_LEVEL - 1 ? MAX_HERO_LEVEL : hero.level + 2;
  } else {
    hero.level++;
  }

  const updatedStats = calculateUpdatedStats(
    unitsBaseCombatStats(hero.type),
    levelCurve(hero.level),
    UnitTypeMultiplier(hero.type),
    DoctrineMultiplier[doctrine],
    hero.combatStats,
    hero.mana
  );

  hero.combatStats = { ...updatedStats };
  hero.mana = updatedStats.mana;

  hero.cost = getRecruitInfo(hero.type).maintainCost * (Math.floor(hero.level / 4) + 1);
};

export const levelUpRegulars = (regular: RegularsState, doctrine: DoctrineType): void => {
  if (regular.type === RegularUnitName.UNDEAD) return;
  if (regular.rank === UnitRank.VETERAN && doctrine === Doctrine.ANTI_MAGIC) return;

  regular.rank = regular.rank === UnitRank.REGULAR ? UnitRank.VETERAN : UnitRank.ELITE;

  const baseStats = unitsBaseCombatStats(regular.type);
  const multipliers = UnitTypeMultiplier(regular.type);
  const doctrineMult = DoctrineMultiplier[doctrine];
  const levelCurveModifier = levelCurve(regular.rank === UnitRank.ELITE ? 7 : 3);

  const updatedStats = calculateUpdatedStats(
    baseStats,
    levelCurveModifier,
    multipliers,
    doctrineMult,
    regular.combatStats
  );

  regular.combatStats = { ...updatedStats };

  regular.cost =
    getRecruitInfo(regular.type).maintainCost * (regular.rank === UnitRank.VETERAN ? 1.5 : 2);
};

const UnitTypeMultiplier = (unitType: HeroUnitType | RegularUnitType): LevelUpParams => {
  switch (unitType) {
    case HeroUnitName.WARSMITH:
    case HeroUnitName.ZEALOT:
    case RegularUnitName.ORC:
      return { attack: 2.7, defense: 0.6, health: 6, rangeDamage: 2.7, speed: 1.0, mana: 0 };
    case HeroUnitName.FIGHTER:
    case HeroUnitName.OGR:
    case HeroUnitName.HAMMER_LORD:
    case HeroUnitName.DRUID:
    case HeroUnitName.CLERIC:
    case RegularUnitName.WARRIOR:
    case RegularUnitName.DWARF:
      return { attack: 2.5, defense: 0.4, health: 5, rangeDamage: 2.5, speed: 1.0, mana: 0.5 };
    case HeroUnitName.RANGER:
    case HeroUnitName.SHADOW_BLADE:
    case RegularUnitName.HALFLING:
    case RegularUnitName.DARK_ELF:
    case RegularUnitName.ELF:
    case HeroUnitName.ENCHANTER:
      return { attack: 1.5, defense: 0.4, health: 3, rangeDamage: 0, speed: 1.0, mana: 0.8 };
    case HeroUnitName.PYROMANCER:
    case HeroUnitName.NECROMANCER:
      return { attack: 0.5, defense: 0.4, health: 2, rangeDamage: 1.8, speed: 1.0, mana: 0.5 };
    case RegularUnitName.WARD_HANDS:
      return { attack: 0.5, defense: 0.4, health: 0.8, rangeDamage: 0, speed: 1.0, mana: 0 };
    case RegularUnitName.UNDEAD:
      return { attack: 0, defense: 0, health: 0, rangeDamage: 0, speed: 1.0, mana: 0 }; // they can't be leveled up'
  }
};

const DoctrineMultiplier: Record<DoctrineType, LevelUpParams> = {
  [Doctrine.NONE]: { attack: 0, defense: 0, health: 0, rangeDamage: 0, speed: 0, mana: 0 },
  [Doctrine.MELEE]: {
    attack: 1.15,
    defense: 1.1,
    health: 1.1,
    rangeDamage: 1,
    speed: 1.00005,
    mana: 0.7,
  },
  [Doctrine.MAGIC]: {
    attack: 0.95,
    defense: 1.0,
    health: 1.0,
    rangeDamage: 1,
    speed: 1.0,
    mana: 1.15,
  },
  [Doctrine.ANTI_MAGIC]: {
    attack: 1.1,
    defense: 1.25,
    health: 1.2,
    rangeDamage: 1,
    speed: 1.005,
    mana: 0,
  },
  [Doctrine.PURE_MAGIC]: {
    attack: 0.85,
    defense: 0.95,
    health: 0.95,
    rangeDamage: 1,
    speed: 1.0,
    mana: 1.5,
  },
  [Doctrine.UNDEAD]: {
    attack: 1.0,
    defense: 0.95,
    health: 0.95,
    rangeDamage: 1,
    speed: 1.0001,
    mana: 1.0,
  },
};
