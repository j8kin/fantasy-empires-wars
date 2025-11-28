import { GameState } from '../../state/GameState';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { isHeroType, isMageType } from '../../types/UnitType';
import { getLands } from './getLands';
import { HeroState } from '../../state/army/HeroState';

/**
 * Retrieves a list of all hero units in the game include heroes in Quest.
 *
 * @function
 * @param gameState - The current game state.
 * @param {boolean} [isMageUnit] - Optional parameter to filter hero units:
 *    If true, only mage units are retrieved.
 *    If false, then non-mage units returned
 *    If not specified, all units are returned.
 * @returns {HeroState[]} An array of hero units. The array can be empty if no heroes are available or match the specified criteria.
 */
export const getAllHeroes = (gameState: GameState, isMageUnit?: boolean): HeroState[] => {
  const turnOwner = getTurnOwner(gameState);

  // get all heroes in the battlefield
  const allHeroes: HeroState[] =
    getLands({ gameState: gameState, noArmy: false }).flatMap((land) =>
      land.army
        .filter((army) => army.controlledBy === turnOwner.id)
        .flatMap(
          (army) =>
            army.heroes.filter((u) =>
              isMageUnit == null
                ? isHeroType(u.type)
                : isMageUnit
                  ? isMageType(u.type)
                  : !isMageType(u.type)
            ) as HeroState[]
        )
    ) || [];
  // add all heroes in a quest
  const heroesInQuest: HeroState[] =
    turnOwner?.quests
      .map((q) => q.hero)
      .filter((h) =>
        isMageUnit == null
          ? isHeroType(h.type)
          : isMageUnit
            ? isMageType(h.type)
            : !isMageType(h.type)
      ) || [];

  allHeroes.push(...heroesInQuest);
  return allHeroes;
};
