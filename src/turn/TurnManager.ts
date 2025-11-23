import { GameState, TurnPhase } from '../state/GameState';
import { startTurn } from './startTurn';
import { endTurn } from './endTurn';
import { mainAiTurn } from './mainAiTurn';
import { HeroOutcome } from '../types/HeroOutcome';

export interface TurnManagerCallbacks {
  onTurnPhaseChange: (gameState: GameState, phase: TurnPhase) => void;
  onGameOver: (message: string) => void;
  onStartProgress: (message: string) => void;
  onHideProgress: () => void;
  onComputerMainTurn: (gameState: GameState) => void;
  onHeroOutcomeResult: (results: HeroOutcome[]) => void;
}

export class TurnManager {
  private callbacks: TurnManagerCallbacks;
  private activeTimers: Set<NodeJS.Timeout> = new Set();

  constructor(callbacks: TurnManagerCallbacks) {
    this.callbacks = callbacks;
  }

  public cleanup(): void {
    // Clear all active timers
    this.activeTimers.forEach((timer) => clearTimeout(timer));
    this.activeTimers.clear();
  }

  public startNewTurn(gameState: GameState): void {
    // Set turn phase to START
    gameState.turnPhase = TurnPhase.START;
    this.callbacks.onTurnPhaseChange(gameState, TurnPhase.START);

    const player = gameState.turnOwner;
    if (!player) {
      this.callbacks.onGameOver('No valid player found for turn');
      return;
    }

    // Show progress popup with turn message
    const message =
      gameState.turn === 1
        ? `The banners of ${player.getName()} rise over a new realm!`
        : `Player ${player.getName()} turn`;
    this.callbacks.onStartProgress(message);

    // Execute start turn logic
    const timer = setTimeout(() => {
      this.activeTimers.delete(timer);
      startTurn(gameState, this.callbacks.onHeroOutcomeResult);
      if (gameState.turn === 1) {
        // on first turn place players randomly on a map
        this.endCurrentTurn(gameState);
      } else {
        this.startMainPhase(gameState);
      }
    }, 1000); // Show progress for 1 second
    this.activeTimers.add(timer);
  }

  private startMainPhase(gameState: GameState): void {
    // Set turn phase to MAIN
    gameState.turnPhase = TurnPhase.MAIN;
    this.callbacks.onTurnPhaseChange(gameState, TurnPhase.MAIN);

    const player = gameState.turnOwner;
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
    // Set turn phase to END
    gameState.turnPhase = TurnPhase.END;
    this.callbacks.onTurnPhaseChange(gameState, TurnPhase.END);

    // Execute end turn logic
    endTurn(gameState);

    // Check for game over conditions
    if (gameState.turn > 1) {
      // todo check if this is correct logic and add remove player logic
      const humanPlayers = gameState.allPlayers.filter((p) => p.playerType === 'human');
      const computerPlayers = gameState.allPlayers.filter((p) => p.playerType === 'computer');

      if (humanPlayers.length === 0) {
        this.callbacks.onGameOver('Game Over: No human players remaining');
        return;
      }

      if (computerPlayers.length === 0) {
        this.callbacks.onGameOver('Game Over: No computer players remaining');
        return;
      }
    }

    // Start the next turn
    const nextTurnTimer = setTimeout(() => {
      this.activeTimers.delete(nextTurnTimer);
      this.startNewTurn(gameState);
    }, 500); // Brief delay before starting next turn
    this.activeTimers.add(nextTurnTimer);
  }

  public canEndTurn(gameState: GameState): boolean {
    return gameState.turnPhase === TurnPhase.MAIN && gameState.turnOwner.playerType === 'human';
  }
}
