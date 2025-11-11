import { GameState, getTurnOwner } from '../../types/GameState';
import { getLands } from './getLands';
import { HeroUnit } from '../../types/Army';
import { isHero } from '../../types/Army';

export const findHeroByName = (name: string, gameState: GameState): HeroUnit | undefined => {
  const lands = getLands({
    lands: gameState.battlefield.lands,
    players: [getTurnOwner(gameState)!],
    noArmy: false,
  });

  for (const land of lands) {
    for (const army of land.army) {
      const hero = army.units.find(
        (unit) => isHero(unit) && (unit as HeroUnit).name === name
      ) as HeroUnit;
      if (hero) {
        return hero;
      }
    }
  }

  return undefined;
};
