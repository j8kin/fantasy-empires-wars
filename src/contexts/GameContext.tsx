import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { GameState } from '../types/GameState';
import {
  BattlefieldDimensions,
  BattlefieldSize,
  getBattlefieldDimensions,
} from '../types/BattlefieldSize';
import { GamePlayer } from '../types/GamePlayer';
import { calculateIncome } from '../map/gold/calculateIncome';
import { calculateMaintenance } from '../map/gold/calculateMaintenance';

interface GameContextType {
  // Game State
  gameState?: GameState;

  // Player Management
  getTotalPlayerGold: (player: GamePlayer) => number;
  recalculateAllPlayersIncome: () => void;

  // Game Flow
  updateGameState: (gameState: GameState) => void;

  // Utilities
  mapDimensions: BattlefieldDimensions;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
  initialMapSize?: BattlefieldSize;
}

export const GameProvider: React.FC<GameProviderProps> = ({
  children,
  initialMapSize = 'medium',
}) => {
  const [gameState, setGameState] = useState<GameState | undefined>(undefined);

  const updateGameConfig = useCallback((config: GameState) => {
    setGameState(config);
  }, []);

  const getTotalPlayerGold = useCallback(
    (player: GamePlayer) => {
      return Object.values(gameState?.battlefieldLands || {})
        .filter((battlefieldLand) => battlefieldLand.controlledBy === player.id)
        .reduce((total, battlefieldLand) => total + battlefieldLand.goldPerTurn, 0);
    },
    [gameState?.battlefieldLands]
  );

  const recalculateAllPlayersIncome = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;

      // Calculate income for a player
      const selectedPlayerIncome =
        calculateIncome(prev, prev.selectedPlayer) -
        calculateMaintenance(prev, prev.selectedPlayer);

      // Calculate income for all opponents
      const updatedOpponents = prev.opponents.map((opponent) => {
        const tempGameState = { ...prev, selectedPlayer: opponent };
        const opponentIncome =
          calculateIncome(tempGameState, opponent) - calculateMaintenance(tempGameState, opponent);
        return {
          ...opponent,
          income: opponentIncome,
        };
      });

      // Update selected player with their income
      const updatedSelectedPlayer = {
        ...prev.selectedPlayer,
        income: selectedPlayerIncome,
      };

      return {
        ...prev,
        selectedPlayer: updatedSelectedPlayer,
        opponents: updatedOpponents,
      };
    });
  }, []);

  const mapDimensions = useMemo(
    () => getBattlefieldDimensions(gameState?.mapSize || initialMapSize),
    [gameState?.mapSize, initialMapSize]
  );

  const contextValue: GameContextType = {
    gameState,
    updateGameState: updateGameConfig,
    getTotalPlayerGold,
    recalculateAllPlayersIncome,
    mapDimensions,
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
