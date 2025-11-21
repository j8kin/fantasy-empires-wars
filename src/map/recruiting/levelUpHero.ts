import { getDefaultUnit, HeroUnit, HeroUnitType } from '../../types/Army';
import { TreasureItem } from '../../types/Treasures';
import { Alignment } from '../../types/Alignment';
import { PlayerState } from '../../types/PlayerState';

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
/**
 * Hero level up. It could be done as result of battle win or by complete quest
 * @param hero
 * @param player - hero owner to calculate additional bonuses
 */
export const levelUpHero = (hero: HeroUnit, player: PlayerState): void => {
  if (hero.level === 32) return; // hero reached max level

  if (
    hero.artifacts.length > 0 &&
    hero.artifacts.some((a) => a.id === TreasureItem.RING_OF_EXPERIENCE)
  ) {
    hero.level = hero.level === 31 ? 32 : hero.level + 2;
  } else {
    hero.level++;
  }

  // stat_gain = base_gain * class_factor * race_factor * alignment_factor
  // increase characteristics
  const baseHeroClass = getDefaultUnit(hero.id) as HeroUnit;
  const baseLevelUpParams = baseLevelUpParameters(hero.id);
  const alignmentModifier = alignmentModifiers(player.getAlignment());
  hero.attack = Math.floor(
    baseHeroClass.attack + baseLevelUpParams.attack * alignmentModifier.attack * (hero.level - 1)
  );
  hero.defense = Math.floor(
    baseHeroClass.defense + baseLevelUpParams.defense * alignmentModifier.defense * (hero.level - 1)
  );
  hero.rangeDamage =
    hero.rangeDamage && baseHeroClass.rangeDamage
      ? Math.floor(
          baseHeroClass.rangeDamage +
            baseLevelUpParams.rangeDamage * alignmentModifier.attack * (hero.level - 1)
        )
      : undefined;
  hero.health = Math.floor(
    baseHeroClass.health + baseLevelUpParams.health * alignmentModifier.health * (hero.level - 1)
  );
  hero.mana =
    hero.mana && baseHeroClass.mana
      ? Math.floor(
          baseHeroClass.mana + baseLevelUpParams.mana * alignmentModifier.mana * (hero.level - 1)
        )
      : undefined;
};
