import { GameState } from '../../state/GameState';
import { isHeroType } from '../../types/UnitType';
import { HeroUnit } from '../../types/HeroUnit';

import { getLands } from './getLands';

export const findHeroByName = (name: string, gameState: GameState): HeroUnit | undefined => {
  const lands = getLands({
    gameState: gameState,
    players: [gameState.turnOwner.id],
    noArmy: false,
  });

  for (const land of lands) {
    for (const army of land.army) {
      const hero = army.units.find(
        (unit) => isHeroType(unit.id) && (unit as HeroUnit).name === name
      ) as HeroUnit;
      if (hero) {
        return hero;
      }
    }
  }

  return undefined;
};
