import { GameState } from '../../state/GameState';
import { endTurn } from '../../turn/endTurn';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('End of Turn Phase', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createDefaultGameStateStub();
  });

  it('Active player id should be changed to a next one', () => {
    expect(gameStateStub.turnOwner.id).toBe(gameStateStub.allPlayers[0].id);

    endTurn(gameStateStub);
    expect(gameStateStub.turnOwner.id).toBe(gameStateStub.allPlayers[1].id);
  });

  it('Active player id should be changed to the first one when all player and increas turn number', () => {
    expect(gameStateStub.turn).toBe(2);
    gameStateStub.nextPlayer();
    gameStateStub.nextPlayer();
    expect(gameStateStub.allPlayers.length).toBe(3);
    expect(gameStateStub.turnOwner.id).toBe(gameStateStub.allPlayers[2].id);
    expect(gameStateStub.turn).toBe(2);

    endTurn(gameStateStub);
    expect(gameStateStub.turnOwner.id).toBe(gameStateStub.allPlayers[0].id);
    expect(gameStateStub.turn).toBe(3);
  });
});
