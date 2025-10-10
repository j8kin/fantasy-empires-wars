import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { GameState, HexTileState, createTileId } from '../types/HexTileState';
import { initializeMap } from '../map/generation/mapGeneration';
import {
  BattlefieldDimensions,
  BattlefieldSize,
  getBattlefieldDimensions,
} from '../types/BattlefieldSize';
import { Position } from '../map/utils/mapTypes';
import { GamePlayer } from '../types/GamePlayer';
import { Building } from '../types/Building';
import { Army } from '../types/Army';

interface GameContextType {
  // Game State
  gameState: GameState;

  // Battlefield Management
  updateTile: (tileId: string, updates: Partial<HexTileState>) => void;
  setTileController: (tileId: string, player: GamePlayer) => void;
  addBuildingToTile: (tileId: string, building: Building) => void;
  updateTileArmy: (tileId: string, army: Army) => void;
  getTile: (position: Position) => HexTileState | undefined;

  // Player Management
  getPlayerTiles: (player: GamePlayer) => HexTileState[];
  getTotalPlayerGold: (player: GamePlayer) => number;

  // Game Flow
  nextTurn: () => void;
  changeBattlefieldSize: (newSize: BattlefieldSize) => void;
  updateGameConfig: (config: GameState) => void;

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
    tiles: initializeMap(initialMapSize),
    turn: 1,
    mapSize: initialMapSize,
  }));

  const updateTile = useCallback((tileId: string, updates: Partial<HexTileState>) => {
    setGameState((prev) => {
      const tile = prev.tiles?.[tileId];
      if (!tile) {
        return prev; // Return unchanged state if tile doesn't exist
      }
      return {
        ...prev,
        tiles: {
          ...prev.tiles,
          [tileId]: {
            ...tile,
            ...updates,
          },
        },
      };
    });
  }, []);

  const setTileController = useCallback(
    (tileId: string, player: GamePlayer) => {
      updateTile(tileId, { controlledBy: player.id });
    },
    [updateTile]
  );

  const addBuildingToTile = useCallback((tileId: string, building: Building) => {
    setGameState((prev) => {
      const tile = prev.tiles[tileId];
      if (!tile) return prev;

      const newGoldPerTurn = tile.goldPerTurn + building.maintainCost;

      return {
        ...prev,
        tiles: {
          ...prev.tiles,
          [tileId]: {
            ...tile,
            buildings: [...tile.buildings, building],
            goldPerTurn: newGoldPerTurn,
          },
        },
      };
    });
  }, []);

  const updateTileArmy = useCallback(
    (tileId: string, army: Army) => {
      updateTile(tileId, { army });
    },
    [updateTile]
  );

  const changeBattlefieldSize = useCallback((newSize: BattlefieldSize) => {
    setGameState((prev) => ({
      ...prev,
      tiles: initializeMap(newSize),
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
    setGameState((prev) => {
      const allPlayers = [
        ...(config.selectedPlayer ? [config.selectedPlayer] : []),
        ...(config.opponents || []),
      ];

      return {
        ...prev,
        selectedPlayer: config.selectedPlayer,
        opponents: config.opponents,
        mapSize: config.mapSize || prev.mapSize,
        tiles: initializeMap(config.mapSize || prev.mapSize, allPlayers),
      };
    });
  }, []);

  const getTile = useCallback(
    (position: Position) => {
      const tileId = createTileId(position);
      return gameState.tiles?.[tileId];
    },
    [gameState.tiles]
  );

  const getPlayerTiles = useCallback(
    (player: GamePlayer) => {
      return Object.values(gameState.tiles || {}).filter((tile) => tile.controlledBy === player.id);
    },
    [gameState.tiles]
  );

  const getTotalPlayerGold = useCallback(
    (player: GamePlayer) => {
      return getPlayerTiles(player).reduce((total, tile) => total + tile.goldPerTurn, 0);
    },
    [getPlayerTiles]
  );

  const mapDimensions = useMemo(
    () => getBattlefieldDimensions(gameState.mapSize),
    [gameState.mapSize]
  );

  const contextValue: GameContextType = {
    gameState,
    updateTile,
    setTileController,
    addBuildingToTile,
    updateTileArmy,
    changeBattlefieldSize,
    nextTurn,
    updateGameConfig,
    getTile,
    getPlayerTiles,
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
