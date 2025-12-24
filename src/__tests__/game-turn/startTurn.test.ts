import { getTurnOwner } from '../../selectors/playerSelectors';
import { startTurn } from '../../turn/startTurn';
import { calculatePlayerIncome } from '../../map/vault/calculatePlayerIncome';
import { construct } from '../../map/building/construct';
import { createGameStateStub } from '../utils/createGameStateStub';
import { nextPlayer } from '../../systems/playerActions';
import { BuildingName } from '../../types/Building';
import type { GameState } from '../../state/GameState';

describe('Start Turn phase', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createGameStateStub({ nPlayers: 2, addPlayersHomeland: false });
    gameStateStub.players.forEach((player) => {
      player.vault = 0;
    });
    construct(gameStateStub, BuildingName.STRONGHOLD, { row: 3, col: 3 });
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
      expect(gameStateStub.players[0].vault).toBe(0);
      expect(getTurnOwner(gameStateStub).landsOwned.size).toBe(7);

      while (gameStateStub.turn < turn) nextPlayer(gameStateStub);

      expect(gameStateStub.turn).toBe(turn);
      startTurn(gameStateStub);

      expect(gameStateStub.players[0].vault).toBe(expectedVault);
      expect(calculatePlayerIncome(gameStateStub)).toBe(expectedCalculatedIncome);
    }
  );
});
