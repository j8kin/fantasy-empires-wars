import { GameState } from '../../state/GameState';
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
      const hero = army.heroes.find((unit) => unit.name === name) as HeroUnit;
      if (hero) {
        return hero;
      }
    }
  }

  return undefined;
};
