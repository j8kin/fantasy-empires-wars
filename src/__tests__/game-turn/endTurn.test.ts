import { GameState } from '../../types/GameState';
import { endTurn } from '../../turn/endTurn';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('End of Turn Phase', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createDefaultGameStateStub();
  });

  it('Active player id should be changed to a next one', () => {
    expect(gameStateStub.turnOwner).toBe(gameStateStub.players[0].id);

    endTurn(gameStateStub);
    expect(gameStateStub.turnOwner).toBe(gameStateStub.players[1].id);
  });

  it('Active player id should be changed to the first one when all player and increas turn number', () => {
    gameStateStub.turnOwner = gameStateStub.players[gameStateStub.players.length - 1].id;
    expect(gameStateStub.turn).toBe(1);

    endTurn(gameStateStub);
    expect(gameStateStub.turnOwner).toBe(gameStateStub.players[0].id);
    expect(gameStateStub.turn).toBe(2);
  });
});
