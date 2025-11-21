import { GameState } from '../../state/GameState';
import { startTurn } from '../../turn/startTurn';
import { calculatePlayerIncome } from '../../map/vault/calculatePlayerIncome';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('Start Turn phase', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createDefaultGameStateStub();
    gameStateStub.players.forEach((player) => {
      player.vault = 0;
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
    (turn: number, expectedVault: number, expectedCalculatedIncome: number) => {
      expect(gameStateStub.players[0].vault).toBe(0);

      gameStateStub.turn = turn;
      startTurn(gameStateStub);

      expect(gameStateStub.players[0].vault).toBe(expectedVault);
      expect(calculatePlayerIncome(gameStateStub)).toBe(expectedCalculatedIncome);
    }
  );
});
