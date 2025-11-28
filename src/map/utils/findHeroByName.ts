import { GameState } from '../../state/GameState';
import { HeroState } from '../../state/army/HeroState';

import { getLands } from './getLands';

export const findHeroByName = (name: string, gameState: GameState): HeroState | undefined => {
  const lands = getLands({
    gameState: gameState,
    players: [gameState.turnOwner],
    noArmy: false,
  });

  for (const land of lands) {
    for (const army of land.army) {
      const hero = army.heroes.find((unit) => unit.name === name) as HeroState;
      if (hero) {
        return hero;
      }
    }
  }

  return undefined;
};
