import { GameState } from '../../state/GameState';
import { addHero, addRegulars } from '../../systems/armyActions';
import { isMoving } from '../../selectors/armySelectors';
import { getPlayerLands } from '../../selectors/playerSelectors';
import { armyFactory } from '../../factories/armyFactory';
import { heroFactory } from '../../factories/heroFactory';
import { regularsFactory } from '../../factories/regularsFactory';

import { isHeroType } from '../../types/UnitType';
import { HeroOutcome, HeroOutcomeType } from '../../types/HeroOutcome';

import { generateHeroName } from './heroNameGeneration';
import { heroRecruitingMessage } from './heroRecruitingMessage';

import { getArmiesAtPosition, addArmyToGameState, updateArmyInGameState } from '../utils/armyUtils';

export const completeRecruiting = (gameState: GameState): HeroOutcome[] => {
  const heroesRecruited: HeroOutcome[] = [];
  const { turnOwner } = gameState;

  getPlayerLands(gameState)
    .filter(
      (l) =>
        l.buildings.length > 0 &&
        l.buildings.some((b) => b.numberOfSlots > 0 && b.slots && b.slots.length > 0)
    )
    .forEach((l) =>
      l.buildings.forEach((b) => {
        if (b.slots && b.slots.length > 0) {
          b.slots.forEach((s) => {
            s.turnsRemaining--;
            if (s.turnsRemaining === 0) {
              const armiesAtPosition = getArmiesAtPosition(gameState, l.mapPos);
              const stationedArmy = armiesAtPosition.find(
                (a) => !isMoving(a) && a.controlledBy === turnOwner
              );

              if (isHeroType(s.unit)) {
                const newHero = heroFactory(s.unit, generateHeroName(s.unit));
                // create a message for hero recruiting
                heroesRecruited.push({
                  status: HeroOutcomeType.Success,
                  message: heroRecruitingMessage(newHero),
                });
                if (stationedArmy) {
                  addHero(stationedArmy, newHero);
                  Object.assign(gameState, updateArmyInGameState(gameState, stationedArmy));
                } else {
                  const newArmy = armyFactory(turnOwner, l.mapPos, [newHero]);
                  Object.assign(gameState, addArmyToGameState(gameState, newArmy));
                }
              } else {
                const newRegulars = regularsFactory(s.unit);
                if (stationedArmy) {
                  addRegulars(stationedArmy, newRegulars);
                  Object.assign(gameState, updateArmyInGameState(gameState, stationedArmy));
                } else {
                  const newArmy = armyFactory(turnOwner, l.mapPos, undefined, [newRegulars]);
                  Object.assign(gameState, addArmyToGameState(gameState, newArmy));
                }
              }
            }
          });
          b.slots = b.slots.filter((s) => s.turnsRemaining > 0);
        }
      })
    );

  return heroesRecruited;
};
