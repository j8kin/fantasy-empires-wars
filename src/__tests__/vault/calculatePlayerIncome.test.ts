import { GameState } from '../../state/GameState';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { TestTurnManagement } from '../utils/TestTurnManagement';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';

describe('calculatePlayerIncome', () => {
  let testTurnManagement: TestTurnManagement;
  let gameStateStub: GameState;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    gameStateStub = createDefaultGameStateStub();
    testTurnManagement = new TestTurnManagement(gameStateStub);

    expect(gameStateStub.turn).toBe(2);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();
  });

  it('income should be calculated correctly each turn', () => {
    expect(getTurnOwner(gameStateStub).id).toBe(gameStateStub.players[0].id);
    expect(gameStateStub.players[0].vault).toBe(15000);
    expect(gameStateStub.players[1].vault).toBe(15000);
    expect(gameStateStub.players[2].vault).toBe(15000);

    testTurnManagement.makeNTurns(1);
    expect(gameStateStub.players[0].vault).toBeGreaterThan(15000); // increased
    expect(gameStateStub.players[1].vault).toBe(15000); // remain since not get turn and they have turn 2
    expect(gameStateStub.players[2].vault).toBe(15000); // remain since not get turn and they have turn 2
    const income0 = getTurnOwner(gameStateStub).vault - 15000;

    testTurnManagement.makeNTurns(1);
    expect(getTurnOwner(gameStateStub).vault).toBe(15000 + income0 * 2);
    expect(gameStateStub.players[1].vault).toBeGreaterThan(15000); // first time increased  on previous turn
    const income1 = gameStateStub.players[1].vault - 15000;
    expect(gameStateStub.players[2].vault).toBeGreaterThan(15000); // first time increased  on previous turn
    const income2 = gameStateStub.players[1].vault - 15000;

    testTurnManagement.makeNTurns(1);
    expect(getTurnOwner(gameStateStub).vault).toBe(15000 + income0 * 3);
    expect(gameStateStub.players[1].vault).toBe(15000 + income1 * 2);
    expect(gameStateStub.players[2].vault).toBeGreaterThan(15000 + income2 * 2);
  });
});
