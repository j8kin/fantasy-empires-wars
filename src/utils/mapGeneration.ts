import { HexTileState, createTileId } from '../types/HexTileState';
import { LAND_TYPES, LandType } from '../types/LandType';
import { NEUTRAL_PLAYER, Player } from '../types/Player';
import { BattlefieldSize, getBattlefieldDimensions } from '../types/BattlefieldSize';
import { GamePlayer } from '../types/GamePlayer';
import { BUILDING_TYPES } from '../types/Building';

type Position = { row: number; col: number };

const calculateBaseLandGold = (landType: LandType): number => {
  const { min, max } = landType.goldPerTurn;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Get neighbors for hexagonal grid (offset coordinates)
const getHexNeighbors = (pos: Position): Position[] => {
  const isEvenRow = pos.row % 2 === 0;

  if (isEvenRow) {
    return [
      { row: pos.row - 1, col: pos.col - 1 }, // NW
      { row: pos.row - 1, col: pos.col }, // NE
      { row: pos.row, col: pos.col + 1 }, // E
      { row: pos.row + 1, col: pos.col }, // SE
      { row: pos.row + 1, col: pos.col - 1 }, // SW
      { row: pos.row, col: pos.col - 1 }, // W
    ];
  } else {
    return [
      { row: pos.row - 1, col: pos.col }, // NW
      { row: pos.row - 1, col: pos.col + 1 }, // NE
      { row: pos.row, col: pos.col + 1 }, // E
      { row: pos.row + 1, col: pos.col + 1 }, // SE
      { row: pos.row + 1, col: pos.col }, // SW
      { row: pos.row, col: pos.col - 1 }, // W
    ];
  }
};

const isValidPosition = (mapSize: BattlefieldSize, pos: Position): boolean => {
  const { rows, cols } = getBattlefieldDimensions(mapSize);
  if (pos.row < 0 || pos.row >= rows) return false;
  const colsInRow = pos.row % 2 === 0 ? cols : cols - 1;
  return pos.col >= 0 && pos.col < colsInRow;
};

const getValidNeighbors = (mapSize: BattlefieldSize, pos: Position): Position[] => {
  return getHexNeighbors(pos).filter((pos) => isValidPosition(mapSize, pos));
};

const getEmptyNeighbors = (
  mapSize: BattlefieldSize,
  position: Position,
  tiles: { [key: string]: HexTileState }
): Position[] | null => {
  const validNeighbors = getValidNeighbors(mapSize, position);
  const noneNeighbors = validNeighbors.filter((pos) => {
    const tileId = createTileId(pos.row, pos.col);
    return tiles[tileId] && tiles[tileId].landType.id === 'none';
  });

  if (noneNeighbors.length === 0) {
    return null;
  }
  return noneNeighbors;
};

const getRandomNoneNeighbor = (
  mapSize: BattlefieldSize,
  pos: Position,
  tiles: { [key: string]: HexTileState }
): { row: number; col: number } | null => {
  const noneNeighbors = getEmptyNeighbors(mapSize, pos, tiles);

  if (noneNeighbors == null) return null;

  const randomIndex = Math.floor(Math.random() * noneNeighbors.length);
  return noneNeighbors[randomIndex];
};

const getNumberOfLands = (tiles: { [key: string]: HexTileState }, landType: LandType): number => {
  return Object.values(tiles).filter((tile) => tile.landType.id === landType.id).length;
};

const getRandomEmptyLandType = (tiles: { [key: string]: HexTileState }): HexTileState | null => {
  const empyLands = Object.values(tiles).filter((tile) => tile.landType.id === LAND_TYPES.none.id);
  if (empyLands.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * empyLands.length);
  return empyLands[randomIndex];
};

export const calculateHexDistance = (
  mapSize: BattlefieldSize,
  startPoint: Position,
  endPoint: Position
): number => {
  if (!isValidPosition(mapSize, startPoint) || !isValidPosition(mapSize, endPoint)) return -1;

  let visited = new Set<Position>();
  let queue: { pos: Position; dist: number }[] = [];
  visited.add(startPoint);
  queue.push({ pos: startPoint, dist: 0 });

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.pos.row === endPoint.row && current.pos.col === endPoint.col) {
      return current.dist;
    }
    const neighbours = getValidNeighbors('huge', current.pos);

    for (let neighbour of neighbours) {
      if (!Array.from(visited).some((n) => n.row === neighbour.row && n.col === neighbour.col)) {
        queue.push({ pos: neighbour, dist: current.dist + 1 });
        visited.add(neighbour);
      }
    }
  }
  return -1; // should never reach here
};

const getTilesInRadius = (
  mapSize: BattlefieldSize,
  centerRow: number,
  centerCol: number,
  radius: number,
  tiles: { [key: string]: HexTileState }
): HexTileState[] => {
  const tilesInRadius: HexTileState[] = [];

  Object.values(tiles).forEach((tile) => {
    const distance = calculateHexDistance(
      mapSize,
      { row: centerRow, col: centerCol },
      { row: tile.row, col: tile.col }
    );

    if (distance <= radius) {
      tilesInRadius.push(tile);
    }
  });

  return tilesInRadius;
};

const findSuitableHomeland = (
  tiles: { [key: string]: HexTileState },
  player: GamePlayer,
  existingPlayerPositions: Position[],
  mapSize: BattlefieldSize
): HexTileState | null => {
  let candidates: HexTileState[] = [];

  // For Necromancer (Undead race), look for volcano first
  if (player.race === 'Undead') {
    candidates = Object.values(tiles).filter((tile) => tile.landType.id === 'volcano');
  }

  // If no volcano found for Necromancer or other players, look for alignment-matching lands
  if (candidates.length === 0) {
    candidates = Object.values(tiles).filter(
      (tile) =>
        tile.landType.alignment === player.alignment &&
        tile.landType.id !== 'none' &&
        tile.landType.id !== 'volcano' &&
        tile.landType.id !== 'lava'
    );
  }

  // If no alignment match, use neutral lands
  if (candidates.length === 0) {
    candidates = Object.values(tiles).filter(
      (tile) =>
        tile.landType.alignment === 'neutral' &&
        tile.landType.id !== 'none' &&
        tile.landType.id !== 'volcano' &&
        tile.landType.id !== 'lava'
    );
  }

  // Filter by distance constraints
  const validCandidates = candidates.filter((candidate) => {
    return existingPlayerPositions.every((pos) => {
      const distance = calculateHexDistance(
        mapSize,
        { row: candidate.row, col: candidate.col },
        pos
      );
      return distance >= 4; // Try radius 4 first
    });
  });

  // If no candidates with radius 4, try radius 3
  if (validCandidates.length === 0) {
    const radius3Candidates = candidates.filter((candidate) => {
      return existingPlayerPositions.every((pos) => {
        const distance = calculateHexDistance(mapSize, candidate, pos);
        return distance >= 3;
      });
    });

    if (radius3Candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * radius3Candidates.length);
      return radius3Candidates[randomIndex];
    }
  }

  if (validCandidates.length > 0) {
    const randomIndex = Math.floor(Math.random() * validCandidates.length);
    return validCandidates[randomIndex];
  }

  // Fallback: any suitable land if distance constraints can't be met
  if (candidates.length > 0) {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  return null; // No suitable homeland found. Should never reach here
};

const assignPlayerLands = (
  tiles: { [key: string]: HexTileState },
  players: GamePlayer[],
  mapSize: BattlefieldSize
): void => {
  const playerPositions: { row: number; col: number }[] = [];

  players.forEach((player) => {
    const homeland = findSuitableHomeland(tiles, player, playerPositions, mapSize);

    if (homeland) {
      // Convert GamePlayer to Player for tile assignment
      const tilePlayer: Player = {
        id: player.id,
        name: player.name,
        color: player.color,
        gold: 0,
        isActive: true,
      };

      // Assign homeland
      homeland.controlledBy = tilePlayer;

      // Add Stronghold building
      homeland.buildings = [BUILDING_TYPES.stronghold];
      homeland.goldPerTurn += BUILDING_TYPES.stronghold.goldPerTurn;

      // Track player position
      playerPositions.push({ row: homeland.row, col: homeland.col });

      // Assign lands in radius 2 to this player
      const tilesInRadius2 = getTilesInRadius(mapSize, homeland.row, homeland.col, 2, tiles);

      tilesInRadius2.forEach((tile) => {
        // Skip if tile is already owned by another player (closer player wins)
        if (tile.controlledBy.id !== NEUTRAL_PLAYER.id) {
          // Find the current owner's homeland position
          let currentOwnerHomeland: { row: number; col: number } | null = null;

          for (let i = 0; i < playerPositions.length - 1; i++) {
            // -1 because current player was just added
            const pos = playerPositions[i];
            const potentialHomeland = Object.values(tiles).find(
              (t) =>
                t.row === pos.row && t.col === pos.col && t.controlledBy.id === tile.controlledBy.id
            );
            if (potentialHomeland) {
              currentOwnerHomeland = { row: pos.row, col: pos.col };
              break;
            }
          }

          if (currentOwnerHomeland) {
            const currentDistance = calculateHexDistance(mapSize, tile, currentOwnerHomeland);

            const newDistance = calculateHexDistance(mapSize, tile, homeland);

            // Only reassign if this player is closer
            if (newDistance < currentDistance) {
              tile.controlledBy = tilePlayer;
            }
          }
        } else {
          tile.controlledBy = tilePlayer;
        }
      });
    }
  });
};

export const initializeMap = (
  mapSize: BattlefieldSize,
  players: GamePlayer[] = []
): { [key: string]: HexTileState } => {
  const { rows, cols } = getBattlefieldDimensions(mapSize);
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
        landType: LAND_TYPES.none, // Temporary, will be overwritten
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
  const volcanoPos = { row: volcanoRow, col: volcanoCol };
  const volcanoId = createTileId(volcanoRow, volcanoCol);
  tiles[volcanoId].landType = LAND_TYPES.volcano;

  // 2. Place up to 6 lava tiles connected to volcano
  const lavaPositions: { row: number; col: number }[] = [];
  const candidateLavaPositions = getValidNeighbors(mapSize, volcanoPos);

  // Randomly select and place lava tiles (up to 6)
  const numLava = Math.min(6, Math.floor(Math.random() * 4) + 2); // 2-5 lava tiles
  const shuffledCandidates = candidateLavaPositions.sort(() => Math.random() - 0.5);

  for (let i = 0; i < numLava && i < shuffledCandidates.length; i++) {
    const lavaPos = shuffledCandidates[i];
    const lavaId = createTileId(lavaPos.row, lavaPos.col);
    tiles[lavaId].landType = LAND_TYPES.lava;
    lavaPositions.push(lavaPos);
  }

  // 3. Set Mountains and DarkForest on Neighbor lands near volcano and lava lands
  getEmptyNeighbors(mapSize, volcanoPos, tiles)?.forEach((neighbor) => {
    tiles[createTileId(neighbor.row, neighbor.col)].landType = LAND_TYPES.mountains;
  });

  for (const lavaPos of lavaPositions) {
    getEmptyNeighbors(mapSize, lavaPos, tiles)?.forEach((neighbor) => {
      const nMountains = getNumberOfLands(tiles, LAND_TYPES.mountains);
      tiles[createTileId(neighbor.row, neighbor.col)].landType =
        nMountains < 6 ? LAND_TYPES.mountains : LAND_TYPES.darkforest;
    });
  }

  // 4. Get remaining land types (excluding volcano and lava)
  const remainingLandTypes = Object.values(LAND_TYPES).filter(
    (lt) => lt.id !== 'volcano' && lt.id !== 'lava' && lt.id !== 'none'
  );

  const maxTilesPerType = Math.floor(totalTiles / remainingLandTypes.length);

  remainingLandTypes.forEach((landType) => {
    while (getNumberOfLands(tiles, landType) < maxTilesPerType) {
      let startLand = getRandomEmptyLandType(tiles);
      if (startLand == null) break;
      tiles[startLand.id].landType = landType;

      // place 6 land of the same time nearby
      for (let i = 0; i < 5 && getNumberOfLands(tiles, landType) < maxTilesPerType; i++) {
        const emptyNeighbor = getRandomNoneNeighbor(mapSize, startLand, tiles);
        if (emptyNeighbor == null) break;
        tiles[createTileId(emptyNeighbor.row, emptyNeighbor.col)].landType = landType;
        startLand = tiles[createTileId(emptyNeighbor.row, emptyNeighbor.col)];
      }
    }
  });

  // if we have empty lands fill with deserts
  Object.values(tiles)
    .filter((tile) => tile.landType.id === LAND_TYPES.none.id)
    .forEach((tile) => (tile.landType = LAND_TYPES.desert));

  // Calculate gold for all tiles
  Object.values(tiles).forEach((tile) => {
    tile.goldPerTurn = calculateBaseLandGold(tile.landType);
  });

  // Assign players to homelands if players are provided
  if (players.length > 0) {
    assignPlayerLands(tiles, players, mapSize);
  }

  return tiles;
};
