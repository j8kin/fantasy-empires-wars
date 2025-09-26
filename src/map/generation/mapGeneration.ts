import { createTileId, HexTileState } from '../../types/HexTileState';
import { getLandById, Land, LAND_TYPE, LandType } from '../../types/Land';
import { BattlefieldSize, getBattlefieldDimensions } from '../../types/BattlefieldSize';
import { GamePlayer, NO_PLAYER } from '../../types/GamePlayer';
import { Position } from '../utils/mapTypes';
import { calculateHexDistance, getTilesInRadius } from '../utils/mapAlgorithms';
import { construct } from '../building/mapBuilding';
import { getLands } from '../utils/mapLands';
import { Alignment } from '../../types/Alignment';

const positionsToTiles = (
  pos: Position[],
  tiles: { [key: string]: HexTileState }
): HexTileState[] => {
  return pos.map((p) => tiles[createTileId(p)]).filter((tile) => tile !== undefined);
};

const calculateBaseLandGold = (landType: Land): number => {
  const { min, max } = landType?.goldPerTurn;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getNumberOfLands = (tiles: { [key: string]: HexTileState }, landType: LandType): number => {
  return Object.values(tiles).filter((tile) => tile.landType.id === landType).length;
};

const getRandomEmptyLandType = (tiles: { [key: string]: HexTileState }): HexTileState | null => {
  const emptyLands = Object.values(tiles).filter((tile) => tile.landType.id === LAND_TYPE.NONE);
  if (emptyLands.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * emptyLands.length);
  return emptyLands[randomIndex];
};

const getEmptyNeighbors = (
  mapSize: BattlefieldSize,
  position: Position,
  tiles: { [key: string]: HexTileState }
): Position[] =>
  positionsToTiles(getTilesInRadius(mapSize, position, 1), tiles)
    .filter((tile) => tile.landType.id === LAND_TYPE.NONE)
    .map((tile) => tile.mapPos);

const getRandomNoneNeighbor = (
  mapSize: BattlefieldSize,
  pos: Position,
  tiles: { [key: string]: HexTileState }
): Position | null => {
  const noneNeighbors = getEmptyNeighbors(mapSize, pos, tiles);

  if (noneNeighbors.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * noneNeighbors.length);
  return noneNeighbors[randomIndex];
};

const findSuitableHomeland = (
  tiles: { [key: string]: HexTileState },
  player: GamePlayer,
  existingPlayerPositions: Position[],
  mapSize: BattlefieldSize
): HexTileState | undefined => {
  let candidates: HexTileState[] = [];
  const battlefieldDimensions = getBattlefieldDimensions(mapSize);

  // For Necromancer (Undead race), look for the volcano first
  if (player.race === 'Undead') {
    candidates = Object.values(tiles).filter(
      (tile) => tile.landType.id === LAND_TYPE.VOLCANO && tile.controlledBy === NO_PLAYER.id
    );
  }

  // If no volcano found for Necromancer or other players, look for alignment-matching lands
  if (candidates.length === 0) {
    candidates = Object.values(tiles).filter(
      (tile) =>
        tile.controlledBy === NO_PLAYER.id &&
        tile.landType.alignment === player.alignment &&
        tile.landType.id !== LAND_TYPE.NONE &&
        tile.landType.id !== LAND_TYPE.VOLCANO &&
        tile.landType.id !== LAND_TYPE.LAVA &&
        // deserts are having a very lack of resources avoid to place home land there
        tile.landType.id !== LAND_TYPE.DESERT &&
        // do not place homeland on the edge of the battlefield
        tile.mapPos.row >= 2 &&
        tile.mapPos.row <= battlefieldDimensions.rows - 2 &&
        tile.mapPos.col >= 2 &&
        tile.mapPos.col <= battlefieldDimensions.cols - 2
    );
  }

  // If no alignment match, use neutral lands
  if (candidates.length === 0) {
    candidates = Object.values(tiles).filter(
      (tile) =>
        tile.controlledBy === NO_PLAYER.id &&
        tile.landType.alignment === Alignment.NEUTRAL &&
        tile.landType.id !== LAND_TYPE.NONE &&
        tile.landType.id !== LAND_TYPE.VOLCANO &&
        tile.landType.id !== LAND_TYPE.LAVA
    );
  }

  // Filter by distance constraints
  const validCandidates = candidates.filter((candidate) => {
    return existingPlayerPositions.every((pos) => {
      const distance = calculateHexDistance(mapSize, candidate.mapPos, pos);
      return distance >= 4; // Try radius 4 first
    });
  });

  // If no candidates with radius 4, try radius 3
  if (validCandidates.length === 0) {
    const radius3Candidates = candidates.filter((candidate) => {
      return existingPlayerPositions.every((pos) => {
        const distance = calculateHexDistance(mapSize, candidate.mapPos, pos);
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

  return undefined; // No suitable homeland found. Should never reach here
};

const addPlayer = (
  player: GamePlayer,
  existingPlayersPositions: Position[],
  tiles: { [key: string]: HexTileState },
  mapSize: BattlefieldSize
) => {
  const homeland = findSuitableHomeland(tiles, player, existingPlayersPositions, mapSize);
  if (!homeland) return; // should never reach here

  homeland.controlledBy = player.id;
  construct(player, 'stronghold', homeland.mapPos, tiles, mapSize);

  // construct one barrack on the same alignment land except homeland
  const playerLands = getLands(
    tiles,
    player,
    homeland.landType.id === LAND_TYPE.VOLCANO ? LAND_TYPE.LAVA : undefined,
    player.alignment,
    true
  );
  const barrackLand = playerLands[Math.floor(Math.random() * playerLands.length)];
  construct(player, 'barracks', barrackLand.mapPos, tiles, mapSize);

  existingPlayersPositions.push(homeland.mapPos);
};

const assignPlayerLands = (
  tiles: { [key: string]: HexTileState },
  players: GamePlayer[],
  mapSize: BattlefieldSize
): void => {
  const playerPositions: Position[] = [];

  // Place Necromancer on volcano first if necromancer is present
  const necromancer = players.find((player) => player.race === 'Undead');
  if (necromancer != null) {
    addPlayer(necromancer, playerPositions, tiles, mapSize);
  }

  players
    .filter((player) => player.id !== necromancer?.id)
    .forEach((player) => {
      addPlayer(player, playerPositions, tiles, mapSize);
    });
};

export const initializeMap = (
  mapSize: BattlefieldSize,
  players: GamePlayer[] = []
): { [key: string]: HexTileState } => {
  const { rows, cols } = getBattlefieldDimensions(mapSize);
  const tiles: { [key: string]: HexTileState } = {};

  // Calculate the total number of tiles
  let totalTiles = 0;
  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    totalTiles += colsInRow;
  }

  // Initialize empty tiles
  for (let row = 0; row < rows; row++) {
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const mapPos: Position = { row: row, col: col };
      const tileId = createTileId(mapPos);
      tiles[tileId] = {
        mapPos: mapPos,
        landType: getLandById(LAND_TYPE.NONE), // Temporary, will be overwritten
        controlledBy: NO_PLAYER.id,
        goldPerTurn: 0, // Will be calculated later
        buildings: [],
        army: { units: [], totalCount: 0 },
      };
    }
  }

  // 1. Place exactly one volcano
  const volcanoRow = Math.floor(Math.random() * (rows - 4)) + 2;
  const volcanoColsInRow = volcanoRow % 2 === 0 ? cols : cols - 1;
  const volcanoCol = Math.floor(Math.random() * (volcanoColsInRow - 4)) + 2;
  const volcanoPos = { row: volcanoRow, col: volcanoCol };
  const volcanoId = createTileId(volcanoPos);
  if (tiles[volcanoId]) {
    tiles[volcanoId].landType = getLandById(LAND_TYPE.VOLCANO);
  }

  // 2. Place up to 6 lava tiles connected to the volcano
  const lavaPositions: Position[] = [];
  const candidateLavaPositions = getTilesInRadius(mapSize, volcanoPos, 1, true);

  // Randomly select and place lava tiles (up to 6)
  const numLava = Math.min(6, Math.floor(Math.random() * 4) + 2); // 2-5 lava tiles
  const shuffledCandidates = candidateLavaPositions.sort(() => Math.random() - 0.5);

  for (let i = 0; i < numLava && i < shuffledCandidates.length; i++) {
    const lavaPos = shuffledCandidates[i];
    const lavaId = createTileId(lavaPos);
    if (tiles[lavaId]) {
      tiles[lavaId].landType = getLandById(LAND_TYPE.LAVA);
      lavaPositions.push(lavaPos);
    }
  }

  // 3. Set Mountains and DarkForest on Neighbor lands near volcano and lava lands
  getEmptyNeighbors(mapSize, volcanoPos, tiles)?.forEach((neighbor) => {
    const tileId = createTileId(neighbor);
    if (tiles[tileId]) {
      tiles[tileId].landType = getLandById(LAND_TYPE.MOUNTAINS);
    }
  });

  for (const lavaPos of lavaPositions) {
    getEmptyNeighbors(mapSize, lavaPos, tiles)?.forEach((neighbor) => {
      const nMountains = getNumberOfLands(tiles, LAND_TYPE.MOUNTAINS);
      const tileId = createTileId(neighbor);
      if (tiles[tileId]) {
        tiles[tileId].landType = getLandById(
          nMountains < 6 ? LAND_TYPE.MOUNTAINS : LAND_TYPE.DARKFOREST
        );
      }
    });
  }

  // 4. Get remaining land types (excluding volcano and lava)
  const remainingLandTypes = Object.values(LAND_TYPE).filter(
    (lt) => lt !== LAND_TYPE.VOLCANO && lt !== LAND_TYPE.LAVA && lt !== LAND_TYPE.NONE
  );

  const maxTilesPerType = Math.floor(totalTiles / remainingLandTypes.length);

  remainingLandTypes.forEach((landType) => {
    while (getNumberOfLands(tiles, landType) < maxTilesPerType) {
      let startLand = getRandomEmptyLandType(tiles);
      if (startLand == null) break;
      const tileId = createTileId(startLand.mapPos);
      if (tiles[tileId]) {
        tiles[tileId].landType = getLandById(landType);
      }

      // place 6 land of the same time nearby
      for (let i = 0; i < 5 && getNumberOfLands(tiles, landType) < maxTilesPerType; i++) {
        const emptyNeighbor = getRandomNoneNeighbor(mapSize, startLand.mapPos, tiles);
        if (emptyNeighbor == null) break;
        const neighborTileId = createTileId(emptyNeighbor);
        if (tiles[neighborTileId]) {
          tiles[neighborTileId].landType = getLandById(landType);
          startLand = tiles[neighborTileId];
        }
      }
    }
  });

  // if we have empty lands fill with deserts
  Object.values(tiles)
    .filter((tile) => tile.landType.id === LAND_TYPE.NONE)
    .forEach((tile) => (tile.landType = getLandById(LAND_TYPE.DESERT)));

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
