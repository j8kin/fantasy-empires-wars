import { useState, useCallback, useMemo } from 'react';
import { GameState, HexTileState, createTileId } from '../types/HexTileState';
import { initializeMap } from '../map/generation/mapGeneration';
import { BattlefieldSize, getBattlefieldDimensions } from '../types/BattlefieldSize';
import { Position } from '../map/utils/mapTypes';
import { GamePlayer } from '../types/GamePlayer';

export const useMapState = (initialMapSize: BattlefieldSize = 'medium') => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    tiles: initializeMap(initialMapSize),
    turn: 1,
    mapSize: initialMapSize,
    selectedPlayer: undefined,
    opponents: undefined,
  }));

  const updateTile = useCallback((tileId: string, updates: Partial<HexTileState>) => {
    setGameState((prev) => ({
      ...prev,
      tiles: {
        ...prev.tiles,
        [tileId]: {
          ...prev.tiles[tileId],
          ...updates,
        },
      },
    }));
  }, []);

  const setTileController = useCallback(
    (tileId: string, player: GamePlayer) => {
      updateTile(tileId, { controlledBy: player });
    },
    [updateTile]
  );

  const addBuildingToTile = useCallback((tileId: string, building: any) => {
    setGameState((prev) => {
      const tile = prev.tiles[tileId];
      if (!tile) return prev;

      const newGoldPerTurn = tile.goldPerTurn + building.goldPerTurn;

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
    (tileId: string, army: any) => {
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
    setGameState((prev) => ({
      ...prev,
      selectedPlayer: config.selectedPlayer,
      opponents: config.opponents,
      mapSize: config.mapSize,
      tiles: config.mapSize !== prev.mapSize ? initializeMap(config.mapSize) : prev.tiles,
    }));
  }, []);

  const getTile = useCallback(
    (position: Position) => {
      const tileId = createTileId(position);
      return gameState.tiles[tileId];
    },
    [gameState.tiles]
  );

  const getPlayerTiles = useCallback(
    (player: GamePlayer) => {
      return Object.values(gameState.tiles).filter((tile) => tile.controlledBy.id === player.id);
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

  return {
    gameState,
    updateTile,
    setTileController,
    addBuildingToTile,
    updateTileArmy,
    changeBattlefieldSize: changeBattlefieldSize,
    nextTurn,
    updateGameConfig,
    getTile,
    getPlayerTiles,
    getTotalPlayerGold,
    mapDimensions,
  };
};
