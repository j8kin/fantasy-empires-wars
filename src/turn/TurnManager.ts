import { getTurnOwner } from '../selectors/playerSelectors';
import { nextPlayer } from '../systems/playerActions';
import { setTurnPhase } from '../systems/gameStateActions';
import { startTurn } from './startTurn';
import { endTurn } from './endTurn';
import { mainAiTurn } from './mainAiTurn';

import { TurnPhase } from './TurnPhase';
import type { GameState } from '../state/GameState';
import type { EmpireEvent } from '../types/EmpireEvent';

export interface TurnManagerCallbacks {
  onTurnPhaseChange: (gameState: GameState, phase: TurnPhase) => void;
  onGameOver: (message: string) => void;
  onStartProgress: (message: string) => void;
  onHideProgress: () => void;
  onComputerMainTurn: (gameState: GameState) => void;
  onEmpireEventResult: (results: EmpireEvent[]) => void;
}

/**
 * TurnManager is responsible for managing the complete turn lifecycle and phase transitions.
 *
 * This class centralizes all turn phase logic, ensuring consistent phase transitions
 * and proper callback handling. It manages:
 * - Phase transitions (START -> MAIN -> END -> next player's START)
 * - Special turn 1 logic (START -> END, skipping MAIN phase)
 * - Turn timing and delays
 * - Computer AI turn handling
 * - Game over conditions
 *
 * @since Refactored to centralize phase management - all phase transitions now go through TurnManager
 */
export class TurnManager {
  private callbacks: TurnManagerCallbacks;
  private activeTimers: Set<NodeJS.Timeout> = new Set();

  constructor(callbacks: TurnManagerCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Centralized phase transition logic - handles all phase changes through TurnManager.
   * This is the single source of truth for phase changes, ensuring consistent
   * state updates and callback notifications.
   *
   * @param gameState The game state to update
   * @param phase The phase to transition to
   */
  private transitionToPhase(gameState: GameState, phase: TurnPhase): void {
    Object.assign(gameState, setTurnPhase(gameState, phase));
    this.callbacks.onTurnPhaseChange(gameState, phase);
  }

  /**
   * Advances to the next phase based on current phase and game rules.
   * Encapsulates all the phase transition logic including special rules for turn 1.
   *
   * @param gameState The game state to advance
   */
  private advanceToNextPhase(gameState: GameState): void {
    switch (gameState.turnPhase) {
      case TurnPhase.START:
        // Special rule: Turn 1 goes START -> END (skip MAIN), Turn >1 goes START -> MAIN
        const nextPhase = gameState.turn === 1 ? TurnPhase.END : TurnPhase.MAIN;
        this.transitionToPhase(gameState, nextPhase);
        break;
      case TurnPhase.MAIN:
        this.transitionToPhase(gameState, TurnPhase.END);
        break;
      case TurnPhase.END:
        // END phase leads to next player's START phase
        nextPlayer(gameState);
        this.transitionToPhase(gameState, TurnPhase.START);
        break;
    }
  }

  public cleanup(): void {
    // Clear all active timers
    this.activeTimers.forEach((timer) => clearTimeout(timer));
    this.activeTimers.clear();
  }

  public startNewTurn(gameState: GameState): void {
    // Ensure we're in START phase and notify callbacks
    this.transitionToPhase(gameState, TurnPhase.START);

    const player = getTurnOwner(gameState);
    if (!player) {
      this.callbacks.onGameOver('No valid player found for turn');
      return;
    }

    // Show progress popup with turn message
    const message =
      gameState.turn === 1
        ? `The banners of ${player.playerProfile.name} rise over a new realm!`
        : `Player ${player.playerProfile.name} turn`;
    this.callbacks.onStartProgress(message);

    // Execute start turn logic
    const timer = setTimeout(() => {
      this.activeTimers.delete(timer);
      startTurn(gameState, this.callbacks.onEmpireEventResult);

      if (gameState.turn === 1) {
        // On first turn, advance to END phase and end immediately
        this.advanceToNextPhase(gameState); // START -> END
        this.endCurrentTurn(gameState);
      } else {
        // Normal turn: advance to MAIN phase
        this.advanceToNextPhase(gameState); // START -> MAIN
        this.startMainPhase(gameState);
      }
    }, 1000); // Show progress for 1 second
    this.activeTimers.add(timer);
  }

  private startMainPhase(gameState: GameState): void {
    // GameState should already be in MAIN phase when this is called
    const player = getTurnOwner(gameState);
    if (!player) {
      // todo handle this case better
      this.callbacks.onGameOver('No valid player found for main phase');
      return;
    }

    if (player.playerType === 'human') {
      // Hide progress popup for human players
      this.callbacks.onHideProgress();
    } else {
      // Execute computer turn
      this.callbacks.onComputerMainTurn(gameState);
      mainAiTurn(gameState);
      // For now, immediately end the computer turn
      const computerTimer = setTimeout(() => {
        this.activeTimers.delete(computerTimer);
        this.endCurrentTurn(gameState);
      }, 2000); // 2 second delay for computer turn
      this.activeTimers.add(computerTimer);
    }
  }

  public endCurrentTurn(gameState: GameState): void {
    // Transition to END phase regardless of current phase
    this.transitionToPhase(gameState, TurnPhase.END);

    // Execute end turn logic
    endTurn(gameState);

    // Check for game over conditions
    if (gameState.turn > 1) {
      // todo check if this is correct logic and add remove player logic
      const humanPlayers = gameState.players.filter((p) => p.playerType === 'human');
      const computerPlayers = gameState.players.filter((p) => p.playerType === 'computer');

      if (humanPlayers.length === 0) {
        this.callbacks.onGameOver('Game Over: No human players remaining');
        return;
      }

      if (computerPlayers.length === 0) {
        this.callbacks.onGameOver('Game Over: No computer players remaining');
        return;
      }
    }

    // Start the next turn after brief delay
    const nextTurnTimer = setTimeout(() => {
      this.activeTimers.delete(nextTurnTimer);
      // Note: endTurn() already called nextPlayer(gameState), so we just need to transition to START phase
      this.transitionToPhase(gameState, TurnPhase.START);
      this.startNewTurn(gameState);
    }, 500); // Brief delay before starting next turn
    this.activeTimers.add(nextTurnTimer);
  }

  public canEndTurn(gameState: GameState): boolean {
    return gameState.turnPhase === TurnPhase.MAIN && getTurnOwner(gameState).playerType === 'human';
  }
}
