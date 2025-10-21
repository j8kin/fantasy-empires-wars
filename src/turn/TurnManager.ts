import { GameState, TurnPhase, getTurnOwner } from '../types/GameState';
import { startTurn } from './startTurn';
import { endTurn } from './endTurn';
import { mainAiTurn } from './mainAiTurn';

export interface TurnManagerCallbacks {
  onTurnPhaseChange: (gameState: GameState, phase: TurnPhase) => void;
  onGameOver: (message: string) => void;
  onStartProgress: (message: string) => void;
  onHideProgress: () => void;
  onComputerMainTurn: (gameState: GameState) => void;
}

export class TurnManager {
  private callbacks: TurnManagerCallbacks;

  constructor(callbacks: TurnManagerCallbacks) {
    this.callbacks = callbacks;
  }

  public startNewTurn(gameState: GameState): void {
    // Set turn phase to START
    gameState.turnPhase = TurnPhase.START;
    this.callbacks.onTurnPhaseChange(gameState, TurnPhase.START);

    const player = getTurnOwner(gameState);
    if (!player) {
      this.callbacks.onGameOver('No valid player found for turn');
      return;
    }

    // Show progress popup with turn message
    const message = `Player ${player.name} turn`;
    this.callbacks.onStartProgress(message);

    // Execute start turn logic
    setTimeout(() => {
      startTurn(gameState);
      this.startMainPhase(gameState);
    }, 1000); // Show progress for 1 second
  }

  private startMainPhase(gameState: GameState): void {
    // Set turn phase to MAIN
    gameState.turnPhase = TurnPhase.MAIN;
    this.callbacks.onTurnPhaseChange(gameState, TurnPhase.MAIN);

    const player = getTurnOwner(gameState);
    if (!player) {
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
      setTimeout(() => {
        this.endCurrentTurn(gameState);
      }, 2000); // 2 second delay for computer turn
    }
  }

  public endCurrentTurn(gameState: GameState): void {
    // Set turn phase to END
    gameState.turnPhase = TurnPhase.END;
    this.callbacks.onTurnPhaseChange(gameState, TurnPhase.END);

    // Execute end turn logic
    endTurn(gameState);

    // Check for game over conditions
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

    // Start the next turn
    setTimeout(() => {
      this.startNewTurn(gameState);
    }, 500); // Brief delay before starting next turn
  }

  public canEndTurn(gameState: GameState): boolean {
    const player = getTurnOwner(gameState);
    return gameState.turnPhase === TurnPhase.MAIN && player?.playerType === 'human';
  }
}
