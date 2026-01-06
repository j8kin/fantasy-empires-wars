import { GameState } from '../../state/GameState';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { endTurn } from '../../turn/endTurn';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { nextPlayer } from '../../systems/playerActions';

describe('End of Turn Phase', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createDefaultGameStateStub();
  });

  it('Active player id should be changed to a next one', () => {
    expect(getTurnOwner(gameStateStub).id).toBe(gameStateStub.players[0].id);

    endTurn(gameStateStub);
    expect(getTurnOwner(gameStateStub).id).toBe(gameStateStub.players[1].id);
  });

  it('Active player id should be changed to the first one when all player and increas turn number', () => {
    expect(gameStateStub.turn).toBe(2);
    nextPlayer(gameStateStub);
    nextPlayer(gameStateStub);
    expect(gameStateStub.players).toHaveLength(3);
    expect(getTurnOwner(gameStateStub).id).toBe(gameStateStub.players[2].id);
    expect(gameStateStub.turn).toBe(2);

    endTurn(gameStateStub);
    expect(getTurnOwner(gameStateStub).id).toBe(gameStateStub.players[0].id);
    expect(gameStateStub.turn).toBe(3);
  });
});
