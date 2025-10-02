import { useState, useCallback, useMemo } from 'react';
import { GameState, HexTileState, createTileId } from '../types/HexTileState';
import { initializeMap } from '../map/generation/mapGeneration';
import { BattlefieldSize, getBattlefieldDimensions } from '../types/BattlefieldSize';
import { Position } from '../map/utils/mapTypes';
import { GamePlayer } from '../types/GamePlayer';
import { Building } from '../types/Building';
import { Army } from '../types/Army';

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
      // Create the list of all players (selectedPlayer + opponents)
      const allPlayers = [config.selectedPlayer!, ...config.opponents!];

      return {
        ...prev,
        selectedPlayer: config.selectedPlayer,
        opponents: config.opponents,
        mapSize: config.mapSize,
        tiles: initializeMap(config.mapSize, allPlayers),
      };
    });
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
      return Object.values(gameState.tiles).filter((tile) => tile.controlledBy === player.id);
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
