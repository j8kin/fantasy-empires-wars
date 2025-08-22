import { useState, useCallback, useMemo } from 'react';
import { MapState, HexTileState, createTileId, getMapDimensions } from '../types/HexTileState';
import { LAND_TYPES, LandType } from '../types/LandType';
import { NEUTRAL_PLAYER, Player } from '../types/Player';

const calculateBaseLandGold = (landType: LandType): number => {
  const { min, max } = landType.goldPerTurn;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Get neighbors for hexagonal grid (offset coordinates)
const getHexNeighbors = (row: number, col: number): { row: number; col: number }[] => {
  const isEvenRow = row % 2 === 0;
  
  if (isEvenRow) {
    return [
      { row: row - 1, col: col - 1 }, // NW
      { row: row - 1, col: col },     // NE
      { row: row, col: col + 1 },     // E
      { row: row + 1, col: col },     // SE
      { row: row + 1, col: col - 1 }, // SW
      { row: row, col: col - 1 },     // W
    ];
  } else {
    return [
      { row: row - 1, col: col },     // NW
      { row: row - 1, col: col + 1 }, // NE
      { row: row, col: col + 1 },     // E
      { row: row + 1, col: col + 1 }, // SE
      { row: row + 1, col: col },     // SW
      { row: row, col: col - 1 },     // W
    ];
  }
};

const isValidPosition = (row: number, col: number, rows: number, cols: number): boolean => {
  if (row < 0 || row >= rows) return false;
  const colsInRow = row % 2 === 0 ? cols : cols - 1;
  return col >= 0 && col < colsInRow;
};

const getValidNeighbors = (
  row: number, 
  col: number, 
  rows: number, 
  cols: number
): { row: number; col: number }[] => {
  return getHexNeighbors(row, col).filter(pos => 
    isValidPosition(pos.row, pos.col, rows, cols)
  );
};

// Check if a land type can be placed next to existing neighbors
const canPlaceLandType = (
  landType: LandType,
  row: number,
  col: number,
  tiles: { [key: string]: HexTileState },
  rows: number,
  cols: number
): boolean => {
  // Temporarily ignore relatedLands restrictions for better land distribution
  return true;
};


const initializeMap = (
  mapSize: 'small' | 'medium' | 'large' | 'huge'
): { [key: string]: HexTileState } => {
  const { rows, cols } = getMapDimensions(mapSize);
  const tiles: { [key: string]: HexTileState } = {};
  
  // Calculate total number of tiles
  let totalTiles = 0;
  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    totalTiles += colsInRow;
  }
  
  // Initialize empty tiles
  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const tileId = createTileId(row, col);
      tiles[tileId] = {
        id: tileId,
        row,
        col,
        landType: LAND_TYPES.plains, // Temporary, will be overwritten
        controlledBy: NEUTRAL_PLAYER,
        goldPerTurn: 0, // Will be calculated later
        buildings: [],
        army: { units: [], totalCount: 0 },
      };
    }
  }
  
  // 1. Place exactly one volcano
  const volcanoRow = Math.floor(Math.random() * rows);
  const volcanoColsInRow = volcanoRow % 2 === 0 ? cols : cols - 1;
  const volcanoCol = Math.floor(Math.random() * volcanoColsInRow);
  const volcanoId = createTileId(volcanoRow, volcanoCol);
  tiles[volcanoId].landType = LAND_TYPES.volcano;
  
  // 2. Place up to 6 lava tiles connected to volcano
  const lavaPositions: { row: number; col: number }[] = [];
  const candidateLavaPositions = getValidNeighbors(volcanoRow, volcanoCol, rows, cols);
  
  // Randomly select and place lava tiles (up to 6)
  const numLava = Math.min(6, Math.floor(Math.random() * 4) + 2); // 2-5 lava tiles
  const shuffledCandidates = candidateLavaPositions.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < numLava && i < shuffledCandidates.length; i++) {
    const lavaPos = shuffledCandidates[i];
    const lavaId = createTileId(lavaPos.row, lavaPos.col);
    tiles[lavaId].landType = LAND_TYPES.lava;
    lavaPositions.push(lavaPos);
  }
  
  // 3. Get remaining land types (excluding volcano and lava)
  const remainingLandTypes = Object.values(LAND_TYPES).filter(
    lt => lt.id !== 'volcano' && lt.id !== 'lava'
  );
  
  // 4. Calculate distribution with 15% limit for each land type
  const volcanoLavaTiles = 1 + lavaPositions.length;
  const remainingTiles = totalTiles - volcanoLavaTiles;
  const maxTilesPerType = Math.floor(totalTiles * 0.15); // 15% of total tiles
  
  // Create distribution array with 15% limit
  const landTypeDistribution: LandType[] = [];
  const landTypeCounts: { [key: string]: number } = {};
  
  // Initialize counts
  remainingLandTypes.forEach(landType => {
    landTypeCounts[landType.id] = 0;
  });
  
  // Distribute tiles with 15% limit
  let tilesAssigned = 0;
  while (tilesAssigned < remainingTiles) {
    let assigned = false;
    
    // Shuffle land types for fair distribution when hitting limits
    const shuffledLandTypes = [...remainingLandTypes].sort(() => Math.random() - 0.5);
    
    for (const landType of shuffledLandTypes) {
      if (tilesAssigned >= remainingTiles) break;
      
      if (landTypeCounts[landType.id] < maxTilesPerType) {
        landTypeDistribution.push(landType);
        landTypeCounts[landType.id]++;
        tilesAssigned++;
        assigned = true;
      }
    }
    
    // If no land type can take more tiles (all at 15% limit), 
    // distribute remaining tiles to plains as fallback
    if (!assigned && tilesAssigned < remainingTiles) {
      const plainsType = LAND_TYPES.plains;
      const remainingToAssign = remainingTiles - tilesAssigned;
      for (let i = 0; i < remainingToAssign; i++) {
        landTypeDistribution.push(plainsType);
      }
      break;
    }
  }
  
  // 5. Place remaining tiles using clustering approach
  const unplacedTiles: { row: number; col: number }[] = [];
  
  // Collect all unplaced positions
  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const tileId = createTileId(row, col);
      if (tiles[tileId].landType.id === 'plains') { // Still temporary
        unplacedTiles.push({ row, col });
      }
    }
  }
  
  // Shuffle both arrays for randomization
  const shuffledUnplaced = unplacedTiles.sort(() => Math.random() - 0.5);
  const shuffledDistribution = landTypeDistribution.sort(() => Math.random() - 0.5);
  
  // Place tiles in clusters
  let distributionIndex = 0;
  const placedTiles = new Set<string>();
  
  for (const position of shuffledUnplaced) {
    const tileId = createTileId(position.row, position.col);
    if (placedTiles.has(tileId)) continue;
    
    if (distributionIndex >= shuffledDistribution.length) break;
    
    const landType = shuffledDistribution[distributionIndex];
    
    // Check if we can place this land type here (considering relatedLands)
    if (canPlaceLandType(landType, position.row, position.col, tiles, rows, cols)) {
      tiles[tileId].landType = landType;
      placedTiles.add(tileId);
      distributionIndex++;
      
      // Try to create a cluster of 4-5 tiles of the same type
      const clusterSize = Math.min(4 + Math.floor(Math.random() * 2), 5); // 4-5 tiles
      let currentClusterSize = 1;
      
      const neighbors = getValidNeighbors(position.row, position.col, rows, cols);
      const shuffledNeighbors = neighbors.sort(() => Math.random() - 0.5);
      
      for (const neighbor of shuffledNeighbors) {
        if (currentClusterSize >= clusterSize) break;
        if (distributionIndex >= shuffledDistribution.length) break;
        
        const neighborId = createTileId(neighbor.row, neighbor.col);
        if (placedTiles.has(neighborId)) continue;
        if (tiles[neighborId].landType.id !== 'plains') continue; // Already placed
        
        const nextLandType = shuffledDistribution[distributionIndex];
        
        // Prefer same land type for clustering, but check compatibility
        if (nextLandType.id === landType.id && 
            canPlaceLandType(nextLandType, neighbor.row, neighbor.col, tiles, rows, cols)) {
          tiles[neighborId].landType = nextLandType;
          placedTiles.add(neighborId);
          distributionIndex++;
          currentClusterSize++;
        }
      }
    } else {
      // Try next land type if current one doesn't fit
      let foundCompatible = false;
      for (let i = 1; i < Math.min(10, shuffledDistribution.length - distributionIndex); i++) {
        const altLandType = shuffledDistribution[distributionIndex + i];
        if (canPlaceLandType(altLandType, position.row, position.col, tiles, rows, cols)) {
          // Swap the land types in distribution
          shuffledDistribution[distributionIndex + i] = shuffledDistribution[distributionIndex];
          shuffledDistribution[distributionIndex] = altLandType;
          
          tiles[tileId].landType = altLandType;
          placedTiles.add(tileId);
          distributionIndex++;
          foundCompatible = true;
          break;
        }
      }
      
      if (!foundCompatible) {
        // Fallback: place plains (most compatible)
        tiles[tileId].landType = LAND_TYPES.plains;
        placedTiles.add(tileId);
      }
    }
  }
  
  // Fill any remaining tiles with plains
  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const tileId = createTileId(row, col);
      if (tiles[tileId].landType.id === 'plains' && !placedTiles.has(tileId)) {
        // Keep as plains
        placedTiles.add(tileId);
      }
    }
  }
  
  // Calculate gold for all tiles
  Object.values(tiles).forEach(tile => {
    tile.goldPerTurn = calculateBaseLandGold(tile.landType);
  });
  
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
