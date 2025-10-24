import { createGameStateStub } from './utils/createGameStateStub';
import { TurnPhase } from '../types/GameState';
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

    expect(
      getLands({ lands: gameState.battlefield.lands, buildings: [BuildingType.STRONGHOLD] }).length
    ).toBe(0);

    startTurn(gameState);

    expect(
      getLands({ lands: gameState.battlefield.lands, buildings: [BuildingType.STRONGHOLD] }).length
    ).toBe(1);
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

    expect(
      getLands({ lands: gameState.battlefield.lands, buildings: [BuildingType.STRONGHOLD] }).length
    ).toBe(gameState.players.length);
  });
});
