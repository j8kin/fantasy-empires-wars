import { GameState, getTurnOwner } from '../../types/GameState';
import { getLands } from './getLands';
import { HeroUnit } from '../../types/Army';
import { isHero } from '../../types/Army';

export const findHeroByName = (name: string, gameState: GameState): HeroUnit | undefined => {
  const heroUnit = getLands({
    lands: gameState.battlefield.lands,
    players: [getTurnOwner(gameState)!],
    noArmy: false,
  }).map(
    (l) =>
      l.army.find((u) => isHero(u.unit) && (u.unit as HeroUnit).name === name)?.unit as HeroUnit
  );
  return heroUnit?.length ? heroUnit[0] : undefined;
};
