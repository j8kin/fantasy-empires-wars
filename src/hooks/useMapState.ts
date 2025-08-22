import { useState, useCallback, useMemo } from 'react';
import { MapState, HexTileState, createTileId, getMapDimensions } from '../types/HexTileState';
import { LAND_TYPES } from '../types/LandType';
import { NEUTRAL_PLAYER, Player } from '../types/Player';

const getRandomLandType = () => {
  const landTypeKeys = Object.keys(LAND_TYPES);
  const randomKey = landTypeKeys[Math.floor(Math.random() * landTypeKeys.length)];
  return LAND_TYPES[randomKey];
};

const calculateBaseLandGold = (landTypeId: string): number => {
  const goldMap: { [key: string]: number } = {
    plains: 3,
    mountains: 5,
    greenforest: 2,
    darkforest: 1,
    hills: 4,
    swamp: 1,
    desert: 0,
    lava: 2,
    volcano: 0,
  };
  return goldMap[landTypeId] || 0;
};

const initializeMap = (
  mapSize: 'small' | 'medium' | 'large' | 'huge'
): { [key: string]: HexTileState } => {
  const { rows, cols } = getMapDimensions(mapSize);
  const tiles: { [key: string]: HexTileState } = {};

  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const tileId = createTileId(row, col);
      const landType = getRandomLandType();

      tiles[tileId] = {
        id: tileId,
        row,
        col,
        landType,
        controlledBy: NEUTRAL_PLAYER,
        goldPerTurn: calculateBaseLandGold(landType.id),
        buildings: [],
        army: { units: [], totalCount: 0 },
      };
    }
  }

  return tiles;
};

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
