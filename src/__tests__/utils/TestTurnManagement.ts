import { GameState, TurnPhase } from '../../state/GameState';
import { TurnManager, TurnManagerCallbacks } from '../../turn/TurnManager';

export class TestTurnManagement {
  private turnManager: TurnManager;
  private gameStateStub?: GameState;
  private readonly mockCallbacks: jest.Mocked<TurnManagerCallbacks>;

  constructor(gameStateStub?: GameState) {
    this.mockCallbacks = {
      onTurnPhaseChange: jest.fn(),
      onGameOver: jest.fn(),
      onStartProgress: jest.fn(),
      onHideProgress: jest.fn(),
      onComputerMainTurn: jest.fn(),
      onHeroOutcomeResult: jest.fn(),
    };

    this.turnManager = new TurnManager(this.mockCallbacks);
    if (gameStateStub != null) {
      this.gameStateStub = gameStateStub;
    }
  }

  setGameState(gameState: GameState): void {
    this.gameStateStub = gameState;
  }
  /**
   * Simulates clicking the "End Turn" button by ending the current turn
   * and advancing timers to transition from MAIN -> END -> START phase
   */
  clickEndOfTurn = (): void => {
    expect(this.gameStateStub).toBeDefined();
    expect(this.gameStateStub!.turnPhase).toBe(TurnPhase.MAIN);

    this.turnManager.endCurrentTurn(this.gameStateStub!);
    expect(this.gameStateStub!.turnPhase).toBe(TurnPhase.END);

    jest.advanceTimersByTime(500);
    expect(this.gameStateStub!.turnPhase).toBe(TurnPhase.START);
  };

  /**
   * Waits for the START phase to complete by advancing timers
   * and transitioning from START -> MAIN phase
   */
  waitStartPhaseComplete = (): void => {
    expect(this.gameStateStub).toBeDefined();
    expect(this.gameStateStub!.turnPhase).toBe(TurnPhase.START);
    jest.advanceTimersByTime(1000);
    expect(this.gameStateStub!.turnPhase).toBe(TurnPhase.MAIN);
  };

  /**
   * Performs AI turns for computer players by simulating the full turn cycle
   * @param owner - The current turn owner (should be an AI player)
   */
  performAiTurns = (owner: string): void => {
    expect(this.gameStateStub).toBeDefined();
    const cTurn = this.gameStateStub!.turn;
    const cTurnOwner = this.gameStateStub!.turnOwner;
    expect(this.gameStateStub!.turnOwner.getName()).toBe(owner);

    // computer players turns
    expect(this.gameStateStub!.turnPhase).toBe(TurnPhase.START);
    jest.advanceTimersByTime(1000);
    expect(this.gameStateStub!.turnPhase).toBe(TurnPhase.MAIN);
    jest.advanceTimersByTime(2000);
    expect(this.gameStateStub!.turnPhase).toBe(TurnPhase.END);
    jest.advanceTimersByTime(500);

    // new Owner's turn
    expect(this.gameStateStub!.turnPhase).toBe(TurnPhase.START);
    expect(this.gameStateStub!.turnOwner).not.toBe(cTurnOwner);
    expect(this.gameStateStub!.turn).toBe(
      this.gameStateStub!.turnOwner.playerType === 'human' ? cTurn + 1 : cTurn
    );
  };

  /**
   * Advances the game by the specified number of turns, handling both player and AI turns
   * @param turns - Number of complete turns to advance
   */
  makeNTurns = (turns: number): void => {
    expect(this.gameStateStub).toBeDefined();
    const cTurn = this.gameStateStub!.turn;
    for (let i = 0; i < turns; i++) {
      expect(this.gameStateStub!.turnPhase).toBe(TurnPhase.MAIN);

      this.clickEndOfTurn();
      // computer players turns
      while (this.gameStateStub!.turnOwner.playerType !== 'human') {
        this.performAiTurns(this.gameStateStub!.turnOwner.getName());
      }

      expect(this.gameStateStub!.turn).toBe(cTurn + i + 1); // new turn

      this.waitStartPhaseComplete();
    }
  };

  startNewTurn = (gameState: GameState): void => {
    this.turnManager.startNewTurn(gameState);
  };
}
