import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { GameState, TurnPhase } from '../types/GameState';
import { GamePlayer } from '../types/GamePlayer';
import { calculateIncome } from '../map/gold/calculateIncome';
import { calculateMaintenance } from '../map/gold/calculateMaintenance';
import { TurnManager, TurnManagerCallbacks } from '../turn/TurnManager';

interface GameContextType {
  // Game State
  gameState?: GameState;

  // Player Management
  getTotalPlayerGold: (player: GamePlayer) => number;
  recalculateActivePlayerIncome: () => void;

  // Game Flow
  updateGameState: (gameState: GameState) => void;

  // Turn Management
  startNewTurn: () => void;
  endCurrentTurn: () => void;
  canEndTurn: () => boolean;

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

  const updateGameConfig = useCallback(
    (config: GameState) => {
      setGameState(config);

      // Initialize TurnManager when gameState is set
      if (!turnManager && config) {
        const defaultCallbacks: TurnManagerCallbacks = {
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
        };

        const newTurnManager = new TurnManager(defaultCallbacks);
        setTurnManager(newTurnManager);
      }
    },
    [turnManager]
  );

  const getTotalPlayerGold = useCallback(
    (player: GamePlayer) => {
      return Object.values(gameState?.battlefield.lands || {})
        .filter((lands) => lands.controlledBy === player.id)
        .reduce((total, battlefieldLand) => total + battlefieldLand.goldPerTurn, 0);
    },
    [gameState?.battlefield]
  );

  const recalculateActivePlayerIncome = useCallback(() => {
    setGameState((prev) => {
      if (!prev || !prev.turnOwner) return prev;

      // Calculate income only for the active player
      const updatedPlayers = prev.players.map((player) => {
        if (player.id === prev.turnOwner) {
          const playerIncome = calculateIncome(prev) - calculateMaintenance(prev);
          return {
            ...player,
            income: playerIncome,
          };
        }
        return player;
      });

      return {
        ...prev,
        players: updatedPlayers,
      };
    });
  }, []);

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

  const canEndTurn = useCallback(() => {
    if (turnManager && gameState) {
      return turnManager.canEndTurn(gameState);
    }
    return false;
  }, [turnManager, gameState]);

  const setTurnManagerCallbacks = useCallback((callbacks: Partial<TurnManagerCallbacks>) => {
    turnManagerCallbacksRef.current = { ...turnManagerCallbacksRef.current, ...callbacks };
  }, []);

  const contextValue: GameContextType = {
    gameState,
    updateGameState: updateGameConfig,
    getTotalPlayerGold,
    recalculateActivePlayerIncome,
    startNewTurn,
    endCurrentTurn,
    canEndTurn,
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
