import { GameState } from '../../types/GameState';
import { startTurn } from '../../turn/startTurn';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('Start Turn phase', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createDefaultGameStateStub();
  });

  it('Income and Money should be calculated during Start Game phase', () => {
    expect(gameStateStub.players[0].money).toBe(0);
    expect(gameStateStub.players[0].income).toBe(0);

    startTurn(gameStateStub);
    expect(gameStateStub.players[0].money).toBe(714);
    expect(gameStateStub.players[0].income).toBe(714);
  });
});
