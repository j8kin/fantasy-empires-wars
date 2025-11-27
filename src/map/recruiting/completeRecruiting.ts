import { GameState } from '../../state/GameState';
import { BuildingType } from '../../types/Building';
import { isHeroType } from '../../types/UnitType';
import { createArmy } from '../../types/Army';
import { createHeroUnit } from '../../types/HeroUnit';
import { createRegularUnit } from '../../types/RegularUnit';
import { HeroOutcome, HeroOutcomeType } from '../../types/HeroOutcome';
import { generateHeroName } from './heroNameGeneration';
import { heroRecruitingMessage } from './heroRecruitingMessage';

import { getLands } from '../utils/getLands';

export const completeRecruiting = (gameState: GameState): HeroOutcome[] => {
  const heroesRecruited: HeroOutcome[] = [];
  const turnOwner = gameState.turnOwner.id;

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
            const stationedArmy = l.army.find((a) => !a.isMoving && a.controlledBy === turnOwner);
            if (isHeroType(s.unit)) {
              const newHero = createHeroUnit(s.unit, generateHeroName(s.unit));
              // create a message for hero recruiting
              heroesRecruited.push({
                status: HeroOutcomeType.Success,
                message: heroRecruitingMessage(newHero),
              });
              if (stationedArmy) {
                stationedArmy.addHero(newHero);
              } else {
                l.army.push(createArmy(turnOwner, l.mapPos, [newHero]));
              }
            } else {
              const newRegulars = createRegularUnit(s.unit);
              if (stationedArmy) {
                stationedArmy.addRegulars(newRegulars);
              } else {
                l.army.push(createArmy(turnOwner, l.mapPos, undefined, [newRegulars]));
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
