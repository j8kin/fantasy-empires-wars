import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { GameState, TurnPhase } from '../types/GameState';
import { TurnManager, TurnManagerCallbacks } from '../turn/TurnManager';
import { HeroOutcome } from '../types/HeroOutcome';

interface GameContextType {
  // Game State
  gameState?: GameState;

  // Game Flow
  updateGameState: (gameState: GameState) => void;
  startNewGame: (gameState: GameState) => void;

  // Turn Management
  startNewTurn: () => void;
  endCurrentTurn: () => void;

  // Turn Manager Callbacks
  setTurnManagerCallbacks: (callbacks: Partial<TurnManagerCallbacks>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | undefined>(undefined);
  const [turnManager, setTurnManager] = useState<TurnManager | undefined>(undefined);
  const turnManagerCallbacksRef = useRef<Partial<TurnManagerCallbacks>>({});

  const createDefaultCallbacks = useCallback((): TurnManagerCallbacks => {
    return {
      onTurnPhaseChange: (gameState: GameState, phase: TurnPhase) => {
        setGameState({ ...gameState });
      },
      onGameOver: (message: string) => {
        turnManagerCallbacksRef.current.onGameOver?.(message);
      },
      onStartProgress: (message: string) => {
        turnManagerCallbacksRef.current.onStartProgress?.(message);
      },
      onHideProgress: () => {
        turnManagerCallbacksRef.current.onHideProgress?.();
      },
      onComputerMainTurn: (gameState: GameState) => {
        turnManagerCallbacksRef.current.onComputerMainTurn?.(gameState);
      },
      onHeroOutcomeResult: (results: HeroOutcome[]) => {
        turnManagerCallbacksRef.current.onHeroOutcomeResult?.(results);
      },
    };
  }, []);

  const updateGameConfig = useCallback(
    (config: GameState) => {
      setGameState(config);

      // Initialize TurnManager when gameState is set (only if not already exists)
      if (!turnManager && config) {
        const defaultCallbacks = createDefaultCallbacks();
        const newTurnManager = new TurnManager(defaultCallbacks);
        setTurnManager(newTurnManager);
      }
    },
    [turnManager, createDefaultCallbacks]
  );

  const startNewGameConfig = useCallback(
    (config: GameState) => {
      // Clean up existing TurnManager if starting a new game
      if (turnManager && typeof turnManager.cleanup === 'function') {
        turnManager.cleanup();
      }

      setGameState(config);

      // Always create a new TurnManager for a new game
      if (config) {
        const defaultCallbacks = createDefaultCallbacks();
        const newTurnManager = new TurnManager(defaultCallbacks);
        setTurnManager(newTurnManager);
      }
    },
    [turnManager, createDefaultCallbacks]
  );

  // Turn management functions
  const startNewTurn = useCallback(() => {
    if (turnManager && gameState) {
      turnManager.startNewTurn(gameState);
    }
  }, [turnManager, gameState]);

  const endCurrentTurn = useCallback(() => {
    if (turnManager && gameState) {
      turnManager.endCurrentTurn(gameState);
    }
  }, [turnManager, gameState]);

  const setTurnManagerCallbacks = useCallback((callbacks: Partial<TurnManagerCallbacks>) => {
    turnManagerCallbacksRef.current = { ...turnManagerCallbacksRef.current, ...callbacks };
  }, []);

  const contextValue: GameContextType = {
    gameState,
    updateGameState: updateGameConfig,
    startNewGame: startNewGameConfig,
    startNewTurn,
    endCurrentTurn,
    setTurnManagerCallbacks,
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
