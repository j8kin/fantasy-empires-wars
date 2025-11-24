import { HeroUnit, isHero, isMage } from '../../types/Unit';
import { getLands } from './getLands';
import { GameState } from '../../state/GameState';

/**
 * Retrieves a list of all hero units in the game include heroes in Quest.
 *
 * @function
 * @param gameState - The current game state.
 * @param {boolean} [isMageUnit] - Optional parameter to filter hero units:
 *    If true, only mage units are retrieved.
 *    If false, then non-mage units returned
 *    If not specified, all units are returned.
 * @returns {HeroUnit[]} An array of hero units. The array can be empty if no heroes are available or match the specified criteria.
 */
export const getAllHeroes = (gameState: GameState, isMageUnit?: boolean): HeroUnit[] => {
  const turnOwner = gameState.turnOwner;

  // get all heroes in the battlefield
  const allHeroes: HeroUnit[] =
    getLands({ gameState: gameState, noArmy: false }).flatMap((land) =>
      land.army
        .filter((army) => army.controlledBy === turnOwner.id && army.units.some(isHero))
        .flatMap(
          (army) =>
            army.units.filter((u) =>
              isMageUnit == null ? isHero(u) : isMageUnit ? isMage(u.id) : !isMage(u.id)
            ) as HeroUnit[]
        )
    ) || [];
  // add all heroes in a quest
  const heroesInQuest: HeroUnit[] =
    turnOwner?.quests
      .map((q) => q.hero)
      .filter((h) =>
        isMageUnit == null ? isHero(h) : isMageUnit ? isMage(h.id) : !isMage(h.id)
      ) || [];

  allHeroes.push(...heroesInQuest);
  return allHeroes;
};
