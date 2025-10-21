import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { GameState } from '../types/GameState';
import { GamePlayer } from '../types/GamePlayer';
import { calculateIncome } from '../map/gold/calculateIncome';
import { calculateMaintenance } from '../map/gold/calculateMaintenance';

interface GameContextType {
  // Game State
  gameState?: GameState;

  // Player Management
  getTotalPlayerGold: (player: GamePlayer) => number;
  recalculateActivePlayerIncome: () => void;

  // Game Flow
  updateGameState: (gameState: GameState) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | undefined>(undefined);

  const updateGameConfig = useCallback((config: GameState) => {
    setGameState(config);
  }, []);

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

  const contextValue: GameContextType = {
    gameState,
    updateGameState: updateGameConfig,
    getTotalPlayerGold,
    recalculateActivePlayerIncome,
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
