import { GameState } from '../../state/GameState';
import { addHero, addRegulars } from '../../systems/armyActions';

import { BuildingType } from '../../types/Building';
import { isHeroType } from '../../types/UnitType';
import { HeroOutcome, HeroOutcomeType } from '../../types/HeroOutcome';

import { generateHeroName } from './heroNameGeneration';
import { heroRecruitingMessage } from './heroRecruitingMessage';

import { getLands } from '../utils/getLands';
import { isMoving } from '../../selectors/armySelectors';
import { armyFactory } from '../../factories/armyFactory';
import { heroFactory } from '../../factories/heroFactory';
import { regularsFactory } from '../../factories/regularsFactory';

export const completeRecruiting = (gameState: GameState): HeroOutcome[] => {
  const heroesRecruited: HeroOutcome[] = [];
  const { turnOwner } = gameState;

  getLands({
    gameState: gameState,
    players: [turnOwner],
    buildings: [
      BuildingType.BARRACKS,
      BuildingType.WHITE_MAGE_TOWER,
      BuildingType.BLACK_MAGE_TOWER,
      BuildingType.GREEN_MAGE_TOWER,
      BuildingType.BLUE_MAGE_TOWER,
      BuildingType.RED_MAGE_TOWER,
    ],
  }).forEach((l) =>
    l.buildings.forEach((b) => {
      if (b.slots && b.slots.length > 0) {
        b.slots.forEach((s) => {
          s.turnsRemaining--;
          if (s.turnsRemaining === 0) {
            const stationedArmy = l.army.find((a) => !isMoving(a) && a.controlledBy === turnOwner);
            if (isHeroType(s.unit)) {
              const newHero = heroFactory(s.unit, generateHeroName(s.unit));
              // create a message for hero recruiting
              heroesRecruited.push({
                status: HeroOutcomeType.Success,
                message: heroRecruitingMessage(newHero),
              });
              if (stationedArmy) {
                addHero(stationedArmy, newHero);
              } else {
                l.army.push(armyFactory(turnOwner, l.mapPos, [newHero]));
              }
            } else {
              const newRegulars = regularsFactory(s.unit);
              if (stationedArmy) {
                addRegulars(stationedArmy, newRegulars);
              } else {
                l.army.push(armyFactory(turnOwner, l.mapPos, undefined, [newRegulars]));
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
