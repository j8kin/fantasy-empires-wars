import { GameState } from '../../state/GameState';
import { PlayerProfile } from '../../state/player/PlayerProfile';
import { LandPosition } from '../../state/map/land/LandPosition';
import { MapDimensions } from '../../state/map/MapDimensions';

import { getTurnOwner } from '../../selectors/playerSelectors';
import { addPlayerToGameState, nextPlayer } from '../../systems/playerActions';
import { levelUpHero } from '../../systems/unitsActions';
import { gameStateFactory } from '../../factories/gameStateFactory';
import { heroFactory } from '../../factories/heroFactory';
import { construct } from '../../map/building/construct';
import { generateMap } from '../../map/generation/generateMap';
import { PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { BuildingName } from '../../types/Building';

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
  battlefieldSize?: MapDimensions;
  realBattlefield?: boolean;
  addPlayersHomeland?: boolean;
}): GameState => {
  const playersProfile = gamePlayers ?? PREDEFINED_PLAYERS.slice(0, nPlayers);

  const map = realBattlefield ? generateMap(battlefieldSize) : generateMockMap(battlefieldSize);
  const stubGameState: GameState = gameStateFactory(map);
  playersProfile.forEach((p, idx) =>
    addPlayerToGameState(stubGameState, p, idx === 0 ? 'human' : 'computer')
  );

  if (addPlayersHomeland) {
    for (let i = 0; i < playersProfile.length; i++) {
      const turnOwner = getTurnOwner(stubGameState);
      const homeland: LandPosition = { row: 3 + (i % 2), col: 3 + i * 5 };
      construct(stubGameState, BuildingName.STRONGHOLD, homeland);

      const playerProfile = turnOwner.playerProfile;
      const hero = heroFactory(playerProfile.type, playerProfile.name);
      while (hero.level < playerProfile.level) levelUpHero(hero, playerProfile.alignment);
      placeUnitsOnMap(hero, stubGameState, homeland);

      nextPlayer(stubGameState);
    }
  }
  return stubGameState;
};
