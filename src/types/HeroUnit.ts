import { HeroUnitType, isMageType } from './UnitType';
import { Artifact, TreasureItem } from './Treasures';
import { Alignment } from './Alignment';
import { BaseUnitStats, getBaseUnitStats, getRecruitDuration } from './BaseUnit';

export interface HeroUnit {
  get id(): HeroUnitType;
  get name(): string; // uniq names
  get level(): number;
  get artifacts(): Artifact[]; // for now, it is planned to have only one artifact per hero
  get mana(): number | undefined; // how many mana produced per turn, undefined for non-magic heroes
  /** return immutable copy of base stats */
  get baseStats(): BaseUnitStats;
  get alignment(): Alignment;
  get recruitCost(): number;
  get maintainCost(): number;
  get recruitDuration(): number;
  get description(): string;

  gainArtifact(artifact: Artifact): void;
  levelUp(playerAlignment: Alignment): void;
}

export const createHeroUnit = (heroType: HeroUnitType, name: string): HeroUnit => {
  const baseUnitStats = getBaseUnitStats(heroType);
  let level = 1;
  let mana = isMageType(heroType) ? 1 : undefined;
  const artifacts: Artifact[] = [];
  return {
    get id(): HeroUnitType {
      return heroType;
    },
    get name(): string {
      return name;
    },
    get level(): number {
      return level;
    },
    get artifacts(): Artifact[] {
      return artifacts;
    },
    get baseStats(): BaseUnitStats {
      return { ...baseUnitStats };
    },
    get alignment(): Alignment {
      return baseUnitStats.alignment;
    },
    get recruitCost(): number {
      return baseUnitStats.recruitCost;
    },
    get recruitDuration(): number {
      return getRecruitDuration(heroType);
    },
    get maintainCost(): number {
      return baseUnitStats.maintainCost;
    },
    get description(): string {
      return baseUnitStats.description;
    },
    get mana(): number | undefined {
      return mana;
    },

    gainArtifact: function (artifact: Artifact): void {
      artifacts.push(artifact);
    },
    /**
     * Hero level up. It could be done as result of battle win or by complete quest
     * @param playerAlignment
     */
    levelUp: function (playerAlignment: Alignment): void {
      if (level === 32) return; // hero reached max level

      if (artifacts.length > 0 && artifacts.some((a) => a.id === TreasureItem.RING_OF_EXPERIENCE)) {
        level = level === 31 ? 32 : level + 2;
      } else {
        level++;
      }

      // stat_gain = base_gain * class_factor * race_factor * alignment_factor
      // increase characteristics
      const baseHeroClass = getBaseUnitStats(heroType);
      const baseLevelUpParams = baseLevelUpParameters(heroType);
      const alignmentModifier = alignmentModifiers(playerAlignment);
      baseUnitStats.attack = Math.floor(
        baseHeroClass.attack + baseLevelUpParams.attack * alignmentModifier.attack * (level - 1)
      );
      baseUnitStats.defense = Math.floor(
        baseHeroClass.defense + baseLevelUpParams.defense * alignmentModifier.defense * (level - 1)
      );
      baseUnitStats.rangeDamage =
        baseUnitStats.rangeDamage && baseHeroClass.rangeDamage
          ? Math.floor(
              baseHeroClass.rangeDamage +
                baseLevelUpParams.rangeDamage * alignmentModifier.attack * (level - 1)
            )
          : undefined;
      baseUnitStats.health = Math.floor(
        baseHeroClass.health + baseLevelUpParams.health * alignmentModifier.health * (level - 1)
      );
      mana =
        mana != null
          ? Math.floor(1 + baseLevelUpParams.mana * alignmentModifier.mana * (level - 1))
          : undefined;
    },
  };
};

const baseLevelUpParameters = (heroType: HeroUnitType) => {
  switch (heroType) {
    case HeroUnitType.WARSMITH:
      return { attack: 2.7, defense: 0.6, health: 6, rangeDamage: 2.7, mana: 0 };
    case HeroUnitType.FIGHTER:
    case HeroUnitType.OGR:
    case HeroUnitType.HAMMER_LORD:
    case HeroUnitType.DRUID:
    case HeroUnitType.CLERIC:
      return { attack: 2.5, defense: 0.4, health: 5, rangeDamage: 2.5, mana: 0.5 };
    case HeroUnitType.RANGER:
    case HeroUnitType.SHADOW_BLADE:
      return { attack: 0.5, defense: 0.4, health: 5, rangeDamage: 1.5, mana: 0 };
    case HeroUnitType.ENCHANTER:
      return { attack: 1.5, defense: 0.4, health: 3, rangeDamage: 0, mana: 0.8 };
    case HeroUnitType.PYROMANCER:
    case HeroUnitType.NECROMANCER:
      return { attack: 0.5, defense: 0.4, health: 2, rangeDamage: 1.8, mana: 0.5 };
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
  }
};
