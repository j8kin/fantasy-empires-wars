import { BattlefieldDimensions, createGameState, GameState } from '../../state/GameState';
import { PlayerProfile, PREDEFINED_PLAYERS } from '../../state/PlayerState';
import { LandPosition } from '../../state/LandState';

import { BuildingType } from '../../types/Building';
import { getDefaultUnit, HeroUnit } from '../../types/Army';
import { construct } from '../../map/building/construct';
import { generateMap } from '../../map/generation/generateMap';
import { levelUpHero } from '../../map/recruiting/levelUpHero';

import { generateMockMap } from './generateMockMap';
import { placeUnitsOnMap } from './placeUnitsOnMap';

export const defaultBattlefieldSizeStub = { rows: 10, cols: 20 };
export const createDefaultGameStateStub = (): GameState => createGameStateStub({});

export const createGameStateStub = ({
  nPlayers = 3,
  gamePlayers,
  battlefieldSize = defaultBattlefieldSizeStub,
  realBattlefield = false,
  addPlayersHomeland = true,
}: {
  nPlayers?: number;
  gamePlayers?: PlayerProfile[];
  battlefieldSize?: BattlefieldDimensions;
  realBattlefield?: boolean;
  addPlayersHomeland?: boolean;
}): GameState => {
  const playersProfile = gamePlayers ?? PREDEFINED_PLAYERS.slice(0, nPlayers);

  const map = realBattlefield ? generateMap(battlefieldSize) : generateMockMap(battlefieldSize);
  const stubGameState: GameState = createGameState(map);
  playersProfile.forEach((p, idx) => stubGameState.addPlayer(p, idx === 0 ? 'human' : 'computer'));

  if (addPlayersHomeland) {
    for (let i = 0; i < playersProfile.length; i++) {
      const turnOwner = stubGameState.turnOwner;
      const homeland: LandPosition = { row: 3 + (i % 2), col: 3 + i * 5 };
      construct(stubGameState, BuildingType.STRONGHOLD, homeland);

      const hero = getDefaultUnit(turnOwner.getType()) as HeroUnit;
      hero.name = turnOwner.getName();
      hero.level = turnOwner.getLevel() - 1;
      levelUpHero(hero, turnOwner);
      placeUnitsOnMap(hero, stubGameState, homeland);

      stubGameState.nextPlayer();
    }
  }
  return stubGameState;
};
