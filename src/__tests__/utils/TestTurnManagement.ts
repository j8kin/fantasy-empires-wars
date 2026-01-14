import { getTurnOwner } from '../../selectors/playerSelectors';
import { nextPlayer } from '../../systems/playerActions';

import { TurnManager } from '../../turn/TurnManager';
import { TurnPhase } from '../../turn/TurnPhase';
import type { GameState } from '../../state/GameState';
import type { TurnManagerCallbacks } from '../../turn/TurnManager';

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
      onEmpireEventResult: jest.fn(),
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
    expect(getTurnOwner(this.gameStateStub!).playerProfile.name).toBe(owner);

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
    expect(this.gameStateStub!.turn).toBe(getTurnOwner(this.gameStateStub!).playerType === 'human' ? cTurn + 1 : cTurn);
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
      while (getTurnOwner(this.gameStateStub!).playerType !== 'human') {
        this.performAiTurns(getTurnOwner(this.gameStateStub!).playerProfile.name);
      }

      expect(this.gameStateStub!.turn).toBe(cTurn + i + 1); // new turn

      this.waitStartPhaseComplete();
    }
  };

  startNewTurn = (gameState: GameState): void => {
    this.turnManager.startNewTurn(gameState);
  };
}
export const nextTurnPhase = (state: GameState): void => {
  switch (state.turnPhase) {
    case TurnPhase.START:
      state.turnPhase = state.turn === 1 ? TurnPhase.END : TurnPhase.MAIN;
      break;
    case TurnPhase.MAIN:
      state.turnPhase = TurnPhase.END;
      break;
    case TurnPhase.END:
      nextPlayer(state);
      state.turnPhase = TurnPhase.START;
      break;
  }
};
