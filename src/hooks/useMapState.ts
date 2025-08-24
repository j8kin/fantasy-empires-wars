import { useState, useCallback, useMemo } from 'react';
import { MapState, HexTileState, createTileId, getMapDimensions } from '../types/HexTileState';
import { NEUTRAL_PLAYER, Player } from '../types/Player';
import { initializeMap } from '../utils/mapGeneration';

export const useMapState = (initialMapSize: 'small' | 'medium' | 'large' | 'huge' = 'medium') => {
  const [mapState, setMapState] = useState<MapState>(() => ({
    tiles: initializeMap(initialMapSize),
    currentPlayer: NEUTRAL_PLAYER,
    players: [NEUTRAL_PLAYER],
    turn: 1,
    mapSize: initialMapSize,
  }));

  const updateTile = useCallback((tileId: string, updates: Partial<HexTileState>) => {
    setMapState((prev) => ({
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
    (tileId: string, player: Player) => {
      updateTile(tileId, { controlledBy: player });
    },
    [updateTile]
  );

  const addBuildingToTile = useCallback((tileId: string, building: any) => {
    setMapState((prev) => {
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

  const changeMapSize = useCallback((newSize: 'small' | 'medium' | 'large' | 'huge') => {
    setMapState((prev) => ({
      ...prev,
      tiles: initializeMap(newSize),
      mapSize: newSize,
    }));
  }, []);

  const addPlayer = useCallback((player: Player) => {
    setMapState((prev) => ({
      ...prev,
      players: [...prev.players, player],
    }));
  }, []);

  const setCurrentPlayer = useCallback((player: Player) => {
    setMapState((prev) => ({
      ...prev,
      currentPlayer: player,
    }));
  }, []);

  const nextTurn = useCallback(() => {
    setMapState((prev) => ({
      ...prev,
      turn: prev.turn + 1,
    }));
  }, []);

  const getTile = useCallback(
    (row: number, col: number) => {
      const tileId = createTileId(row, col);
      return mapState.tiles[tileId];
    },
    [mapState.tiles]
  );

  const getPlayerTiles = useCallback(
    (player: Player) => {
      return Object.values(mapState.tiles).filter((tile) => tile.controlledBy.id === player.id);
    },
    [mapState.tiles]
  );

  const getTotalPlayerGold = useCallback(
    (player: Player) => {
      return getPlayerTiles(player).reduce((total, tile) => total + tile.goldPerTurn, 0);
    },
    [getPlayerTiles]
  );

  const mapDimensions = useMemo(() => getMapDimensions(mapState.mapSize), [mapState.mapSize]);

  return {
    mapState,
    updateTile,
    setTileController,
    addBuildingToTile,
    updateTileArmy,
    changeMapSize,
    addPlayer,
    setCurrentPlayer,
    nextTurn,
    getTile,
    getPlayerTiles,
    getTotalPlayerGold,
    mapDimensions,
  };
};
