import { GameState } from '../../state/GameState';
import { startTurn } from '../../turn/startTurn';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('Start Turn phase', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createDefaultGameStateStub();
    gameStateStub.players.forEach((player) => {
      player.vault = 0;
      player.income = 0;
    });
  });

  /** Test income and money calculation
   * 1. No income and money should be calculated on turn 1
   * 2. Income and money should be calculated on turn 2
   * 3. Income and money should be calculated on turn 3 and above
   **/
  it.each([
    [1, 0, 0],
    [2, 0, 141],
    [3, 141, 141],
  ])(
    'Income and Money calculation based on current turn %s',
    (turn: number, money: number, income: number) => {
      expect(gameStateStub.players[0].vault).toBe(0);
      expect(gameStateStub.players[0].income).toBe(0);

      gameStateStub.turn = turn;
      startTurn(gameStateStub);

      expect(gameStateStub.players[0].vault).toBe(money);
      expect(gameStateStub.players[0].income).toBe(income);
    }
  );
});
