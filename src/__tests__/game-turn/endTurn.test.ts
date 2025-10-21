import { GameState, TurnPhase } from '../../types/GameState';
import { generateMockMap } from '../utils/generateMockMap';
import { PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { toGamePlayer } from '../utils/toGamePlayer';
import { endTurn } from '../../turn/endTurn';

describe('End of Turn Phase', () => {
  let mockGameState: GameState;

  beforeEach(() => {
    mockGameState = {
      battlefield: generateMockMap(10, 10),
      turnOwner: PREDEFINED_PLAYERS[0].id,
      turn: 1,
      players: [...PREDEFINED_PLAYERS.slice(0, 3).map((p) => toGamePlayer(p))],
      turnPhase: TurnPhase.START,
    };
  });
  it('Active player id should be changed to a next one', () => {
    endTurn(mockGameState);
    expect(mockGameState.turnOwner).toBe(PREDEFINED_PLAYERS[1].id);
  });
});
