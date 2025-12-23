import { startTurn } from '../turn/startTurn';
import { endTurn } from '../turn/endTurn';
import { BuildingKind } from '../types/Building';
import type { GameState } from '../state/GameState';
import type { MapDimensions } from '../state/map/MapDimensions';

import { createGameStateStub, defaultBattlefieldSizeStub } from './utils/createGameStateStub';

describe('Game Start: add player to map', () => {
  const getStrongholds = (gameState: GameState) =>
    Object.values(gameState.map.lands).filter((l) =>
      l.buildings.some((b) => b.type === BuildingKind.STRONGHOLD)
    );

  it('turnOwner should be placed on map on Turn 0', () => {
    const gameState = createGameStateStub({
      realBattlefield: true,
      addPlayersHomeland: false,
    });

    expect(getStrongholds(gameState)).toHaveLength(0);

    startTurn(gameState);

    expect(getStrongholds(gameState)).toHaveLength(1);
  });

  it('all players should be placed on map on Turn 1', () => {
    const gameState = createGameStateStub({
      realBattlefield: true,
      addPlayersHomeland: false,
    });

    while (gameState.turn === 1) {
      startTurn(gameState);
      endTurn(gameState);
    }

    expect(getStrongholds(gameState)).toHaveLength(gameState.players.length);
  });

  it.each([
    ['small', { rows: 6, cols: 13 }, 3],
    ['medium', { rows: 9, cols: 18 }, 5],
    ['large', { rows: 11, cols: 23 }, 7],
    ['huge', { rows: 15, cols: 31 }, 8],
    ['test default', defaultBattlefieldSizeStub, 8],
  ])(
    'max players should be placed on real map %s size',
    (size: string, dimensions: MapDimensions, maxPlayerNumber: number) => {
      const gameState = createGameStateStub({
        nPlayers: maxPlayerNumber,
        realBattlefield: true,
        battlefieldSize: dimensions,
        addPlayersHomeland: false,
      });

      while (gameState.turn === 1) {
        startTurn(gameState);
        endTurn(gameState);
      }

      expect(getStrongholds(gameState)).toHaveLength(gameState.players.length);
    }
  );
});
