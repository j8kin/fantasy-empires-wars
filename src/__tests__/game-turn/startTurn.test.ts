import { GameState } from '../../state/GameState';
import { startTurn } from '../../turn/startTurn';
import { calculatePlayerIncome } from '../../map/vault/calculatePlayerIncome';
import { createGameStateStub } from '../utils/createGameStateStub';
import { construct } from '../../map/building/construct';
import { BuildingType } from '../../types/Building';

describe('Start Turn phase', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createGameStateStub({ nPlayers: 2, addPlayersHomeland: false });
    gameStateStub.allPlayers.forEach((player) => {
      player.vault = 0;
    });
    construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
  });

  /** Test income and money calculation
   * 1. No income and money should be calculated on turn 1
   * 2. Income and money should be calculated on turn 2
   * 3. Income and money should be calculated on turn 3 and above
   **/
  it.each([
    [1, 0, 0],
    [2, 0, 441],
    [3, 441, 441],
  ])(
    'Income and Money calculation based on current turn %s',
    (turn: number, expectedVault: number, expectedCalculatedIncome: number) => {
      expect(gameStateStub.allPlayers[0].vault).toBe(0);
      expect(gameStateStub.turnOwner.nLands()).toBe(7);

      while (gameStateStub.turn < turn) gameStateStub.nextPlayer();

      expect(gameStateStub.turn).toBe(turn);
      startTurn(gameStateStub);

      expect(gameStateStub.allPlayers[0].vault).toBe(expectedVault);
      expect(calculatePlayerIncome(gameStateStub)).toBe(expectedCalculatedIncome);
    }
  );
});
