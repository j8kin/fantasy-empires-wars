import { createGameStateStub, defaultBattlefieldSizeStub } from './utils/createGameStateStub';
import { BattlefieldDimensions, TurnPhase } from '../state/GameState';
import { getLands } from '../map/utils/getLands';
import { BuildingType } from '../types/Building';
import { startTurn } from '../turn/startTurn';
import { endTurn } from '../turn/endTurn';

describe('Game Start: add player to map', () => {
  it('turnOwner should be placed on map on Turn 0', () => {
    const gameState = createGameStateStub({
      turnPhase: TurnPhase.START,
      realBattlefield: true,
      addPlayersHomeland: false,
    });

    expect(getLands({ gameState: gameState, buildings: [BuildingType.STRONGHOLD] }).length).toBe(0);

    startTurn(gameState);

    expect(getLands({ gameState: gameState, buildings: [BuildingType.STRONGHOLD] }).length).toBe(1);
  });

  it('all players should be placed on map on Turn 1', () => {
    const gameState = createGameStateStub({
      turnPhase: TurnPhase.START,
      realBattlefield: true,
      addPlayersHomeland: false,
    });

    while (gameState.turn === 1) {
      startTurn(gameState);
      endTurn(gameState);
    }

    expect(getLands({ gameState: gameState, buildings: [BuildingType.STRONGHOLD] }).length).toBe(
      gameState.players.length
    );
  });

  it.each([
    //['small', { rows: 6, cols: 13 }, 3],
    ['medium', { rows: 9, cols: 18 }, 5],
    ['large', { rows: 11, cols: 23 }, 7],
    ['huge', { rows: 15, cols: 31 }, 8],
    ['test default', defaultBattlefieldSizeStub, 8],
  ])(
    'max players should be placed on real map %s size',
    (size: string, dimensions: BattlefieldDimensions, maxPlayerNumber: number) => {
      const gameState = createGameStateStub({
        nPlayers: maxPlayerNumber,
        turnPhase: TurnPhase.START,
        realBattlefield: true,
        battlefieldSize: dimensions,
        addPlayersHomeland: false,
      });

      while (gameState.turn === 1) {
        startTurn(gameState);
        endTurn(gameState);
      }

      expect(getLands({ gameState: gameState, buildings: [BuildingType.STRONGHOLD] }).length).toBe(
        gameState.players.length
      );
    }
  );
});
