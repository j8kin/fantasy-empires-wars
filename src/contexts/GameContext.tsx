import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { GameState, LandState, battlefieldLandId } from '../types/GameState';
import {
  BattlefieldDimensions,
  BattlefieldSize,
  getBattlefieldDimensions,
} from '../types/BattlefieldSize';
import { LandPosition } from '../map/utils/mapLands';
import { GamePlayer } from '../types/GamePlayer';
import { Building } from '../types/Building';
import { Army } from '../types/Army';

interface GameContextType {
  // Game State
  gameState: GameState;

  // Battlefield Management
  updateLand: (battlefieldLandId: string, updates: Partial<LandState>) => void;
  setTileController: (battlefieldLandId: string, player: GamePlayer) => void;
  addBuildingToLand: (battlefieldLandId: string, building: Building) => void;
  updateLandArmy: (battlefieldLandId: string, army: Army) => void;
  getTile: (landPosition: LandPosition) => LandState | undefined;

  // Player Management
  getPlayerLands: (player: GamePlayer) => LandState[];
  getTotalPlayerGold: (player: GamePlayer) => number;

  // Game Flow
  nextTurn: () => void;
  changeBattlefieldSize: (newSize: BattlefieldSize) => void;
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
  const [gameState, setGameState] = useState<GameState>(() => ({
    turn: 1,
    mapSize: initialMapSize,
  }));

  const updateBattlefieldLands = useCallback(
    (battlefieldLandId: string, updates: Partial<LandState>) => {
      setGameState((prev) => {
        const battlefieldLand = prev.battlefieldLands?.[battlefieldLandId];
        if (!battlefieldLand) {
          return prev; // Return unchanged state if tile doesn't exist
        }
        return {
          ...prev,
          battlefieldLands: {
            ...prev.battlefieldLands,
            [battlefieldLandId]: {
              ...battlefieldLand,
              ...updates,
            },
          },
        };
      });
    },
    []
  );

  const setTileController = useCallback(
    (battlefieldLandId: string, player: GamePlayer) => {
      updateBattlefieldLands(battlefieldLandId, { controlledBy: player.id });
    },
    [updateBattlefieldLands]
  );

  const addBuildingToTile = useCallback((battlefieldLandId: string, building: Building) => {
    setGameState((prev) => {
      const battlefieldLand = prev.battlefieldLands?.[battlefieldLandId];
      if (!battlefieldLand) return prev;

      const newGoldPerTurn = battlefieldLand.goldPerTurn + building.maintainCost;

      return {
        ...prev,
        battlefieldLands: {
          ...prev.battlefieldLands,
          [battlefieldLandId]: {
            ...battlefieldLand,
            buildings: [...battlefieldLand.buildings, building],
            goldPerTurn: newGoldPerTurn,
          },
        },
      };
    });
  }, []);

  const updateTileArmy = useCallback(
    (battlefieldLandId: string, army: Army) => {
      updateBattlefieldLands(battlefieldLandId, { army });
    },
    [updateBattlefieldLands]
  );

  const changeBattlefieldSize = useCallback((newSize: BattlefieldSize) => {
    setGameState((prev) => ({
      ...prev,
      mapSize: newSize,
    }));
  }, []);

  const nextTurn = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      turn: prev.turn + 1,
    }));
  }, []);

  const updateGameConfig = useCallback((config: GameState) => {
    setGameState((prev) => ({
      ...prev,
      ...config,
    }));
  }, []);

  const getBattlefieldLand = useCallback(
    (landPosition: LandPosition) => {
      return gameState.battlefieldLands?.[battlefieldLandId(landPosition)];
    },
    [gameState.battlefieldLands]
  );

  const getPlayerLands = useCallback(
    (player: GamePlayer) => {
      return Object.values(gameState.battlefieldLands || {}).filter(
        (battlefieldLand) => battlefieldLand.controlledBy === player.id
      );
    },
    [gameState.battlefieldLands]
  );

  const getTotalPlayerGold = useCallback(
    (player: GamePlayer) => {
      return getPlayerLands(player).reduce(
        (total, battlefieldLand) => total + battlefieldLand.goldPerTurn,
        0
      );
    },
    [getPlayerLands]
  );

  const mapDimensions = useMemo(
    () => getBattlefieldDimensions(gameState.mapSize),
    [gameState.mapSize]
  );

  const contextValue: GameContextType = {
    gameState,
    updateLand: updateBattlefieldLands,
    setTileController,
    addBuildingToLand: addBuildingToTile,
    updateLandArmy: updateTileArmy,
    changeBattlefieldSize,
    nextTurn,
    updateGameState: updateGameConfig,
    getTile: getBattlefieldLand,
    getPlayerLands: getPlayerLands,
    getTotalPlayerGold,
    mapDimensions,
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGameState = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
