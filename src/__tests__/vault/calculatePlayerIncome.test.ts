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

  it ('income should be calculated correctly each turn', () => {
    expect(gameStateStub.turnOwner.vault).toBe(15000);

    testTurnManagement.makeNTurns(1);
    expect(gameStateStub.turnOwner.vault).toBeGreaterThan(15000);
    const income = gameStateStub.turnOwner.vault - 15000;

    testTurnManagement.makeNTurns(1);
    expect(gameStateStub.turnOwner.vault).toBe(15000 + income * 2);
  })
});
