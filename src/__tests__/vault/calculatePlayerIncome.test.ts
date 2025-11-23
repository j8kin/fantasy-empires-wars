import { TestTurnManagement } from '../utils/TestTurnManagement';
import { GameState, TurnPhase } from '../../state/GameState';
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
    expect(gameStateStub.turnPhase).toBe(TurnPhase.START);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();
    expect(gameStateStub.turnPhase).toBe(TurnPhase.MAIN);
  });

  it('income should be calculated correctly each turn', () => {
    expect(gameStateStub.turnOwner.id).toBe(gameStateStub.allPlayers[0].id);
    expect(gameStateStub.allPlayers[0].vault).toBe(15000);
    expect(gameStateStub.allPlayers[1].vault).toBe(15000);
    expect(gameStateStub.allPlayers[2].vault).toBe(15000);

    testTurnManagement.makeNTurns(1);
    expect(gameStateStub.allPlayers[0].vault).toBeGreaterThan(15000); // increased
    expect(gameStateStub.allPlayers[1].vault).toBe(15000); // remain since not get turn and they have turn 2
    expect(gameStateStub.allPlayers[2].vault).toBe(15000); // remain since not get turn and they have turn 2
    const income0 = gameStateStub.turnOwner.vault - 15000;

    testTurnManagement.makeNTurns(1);
    expect(gameStateStub.turnOwner.vault).toBe(15000 + income0 * 2);
    expect(gameStateStub.allPlayers[1].vault).toBeGreaterThan(15000); // first time increased  on previous turn
    const income1 = gameStateStub.allPlayers[1].vault - 15000;
    expect(gameStateStub.allPlayers[2].vault).toBeGreaterThan(15000); // first time increased  on previous turn
    const income2 = gameStateStub.allPlayers[1].vault - 15000;

    testTurnManagement.makeNTurns(1);
    expect(gameStateStub.turnOwner.vault).toBe(15000 + income0 * 3);
    expect(gameStateStub.allPlayers[1].vault).toBe(15000 + income1 * 2);
    expect(gameStateStub.allPlayers[2].vault).toBeGreaterThan(15000 + income2 * 2);
  });
});
