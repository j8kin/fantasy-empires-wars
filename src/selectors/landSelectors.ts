import { getLandId } from '../state/map/land/LandId';
import { getPlayer, getPlayersByDiplomacy, hasTreasureByPlayer } from './playerSelectors';
import { getArmiesAtPosition, getArmiesByPlayer, getPosition } from './armySelectors';
import { getPlayerColorValue } from '../domain/ui/playerColors';
import { getRandomElement } from '../domain/utils/random';
import { NO_PLAYER } from '../domain/player/playerRepository';
import { TreasureName } from '../types/Treasures';
import { SpellName } from '../types/Spell';
import { Alignment } from '../types/Alignment';
import { EffectKind } from '../types/Effect';
import { BuildingName } from '../types/Building';
import { DiplomacyStatus } from '../types/Diplomacy';
import type { GameState } from '../state/GameState';
import type { MapDimensions } from '../state/map/MapDimensions';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { LandState } from '../state/map/land/LandState';
import type { BuildingState } from '../state/map/building/BuildingState';
import type { LandType } from '../types/Land';
import type { BuildingType } from '../types/Building';
import type { Effect, EffectSourceId } from '../types/Effect';
import type { AlignmentType } from '../types/Alignment';
import type { WarMachineType } from '../types/UnitType';
import type { UnitRankType } from '../state/army/RegularsState';

export const getLand = (state: GameState, landPos: LandPosition) => state.map.lands[getLandId(landPos)];

export const getLandOwner = (state: GameState, landPos: LandPosition): string =>
  state.players.find((p) => p.landsOwned.has(getLandId(landPos)))?.id ?? NO_PLAYER.id;

export const getBuilding = (state: LandState, id: string): BuildingState | undefined => {
  return state.buildings.find((b) => b.id === id);
};

interface LandInfo {
  owner: string;
  color: string;
  type: LandType;
  alignment: AlignmentType;
  goldPerTurn: number;
  heroes: string[];
  regulars: { rank: UnitRankType; info: string }[];
  warMachines: string[];
  buildings: BuildingType[];
  effects: Effect[];
  isCorrupted: boolean;
  illusionMsg?: string;
}

export const getLandInfo = (state: GameState, landPos: LandPosition): LandInfo => {
  const land = getLand(state, landPos);
  const landOwner = getPlayer(state, getLandOwner(state, landPos));
  const landOwnerId = landOwner.playerProfile.name;
  const landOwnerColor = getPlayerColorValue(landOwner.color);

  const isIllusion =
    hasTreasureByPlayer(landOwner, TreasureName.MIRROR_OF_ILLUSION) || hasActiveEffect(land, SpellName.ILLUSION);

  const affectedByViewLand =
    hasActiveEffect(land, SpellName.VIEW_TERRITORY, state.turnOwner) ||
    hasActiveEffect(land, TreasureName.COMPASS_OF_DOMINION, state.turnOwner);

  if (landOwnerId !== NO_PLAYER.id && (landOwner.id === state.turnOwner || affectedByViewLand)) {
    if (isIllusion && landOwner.id !== state.turnOwner && affectedByViewLand) {
      return {
        owner: landOwnerId,
        color: landOwnerColor,
        type: land.land.type,
        alignment: land.corrupted ? Alignment.CHAOTIC : land.land.alignment,
        goldPerTurn: land.goldPerTurn,
        effects: [],
        heroes: [],
        regulars: [],
        warMachines: [],
        buildings: [],
        isCorrupted: land.corrupted,
        illusionMsg: getRandomElement(ILLUSION_MESSAGES),
      };
    }

    // provide information about the land for owned territories and territories revealed by VIEW_TERRITORY Spell
    const armies = getArmiesAtPosition(state, landPos);
    return {
      owner: landOwnerId,
      color: landOwnerColor,
      type: land.land.type,
      alignment: land.corrupted ? Alignment.CHAOTIC : land.land.alignment,
      isCorrupted: land.corrupted,
      goldPerTurn: land.goldPerTurn,
      effects: [...land.effects],
      heroes: armies.flatMap((a) => a.heroes).map((h) => `${h.name} lvl: ${h.level}`),
      regulars: armies
        .flatMap((a) => a.regulars)
        .map((r) => ({
          rank: r.rank,
          info: `${r.type} (${r.count}) ${r.rank.charAt(0).toUpperCase()}`,
        })),
      // ignore war-machines durability and return only type and count
      warMachines: Object.entries(
        armies
          .flatMap((a) => a.warMachines)
          .reduce(
            (acc, w) => {
              acc[w.type] = (acc[w.type] || 0) + w.count;
              return acc;
            },
            {} as Record<WarMachineType, number>
          )
      ).map(([type, count]) => `${type} (${count})`),
      buildings: land.buildings.map((b) => b.type),
    };
  } else {
    return {
      owner: landOwnerId,
      color: landOwnerColor,
      type: land.land.type,
      alignment: land.corrupted ? Alignment.CHAOTIC : land.land.alignment,
      isCorrupted: land.corrupted,
      goldPerTurn: land.goldPerTurn,
      effects: [],
      heroes: [],
      regulars: [],
      warMachines: [],
      // return buildings only for neutral lands if VIEW_TERRITORY spell is not affected on opponent
      buildings: landOwnerId === NO_PLAYER.id ? land.buildings.map((b) => b.type) : [],
    };
  }
};

const ILLUSION_MESSAGES: string[] = [
  'Gaze too long, and the mirror gazes back',
  'Look deeper, and the land begins reflects',
  'What you seek - fades, leave only reflection',
  'The truth recoils when watched too closely',
  'The land does not show what it is',
  'Your vision lingers—and something notices',
  'Sight finds no footing where mirrors rule',
  'The land reflects intent, not presence',
  'Focus breaks; the image stares back',
  'Here, sight is a question, not an answer',
];

export const hasActiveEffect = (state: LandState, effectSourceId: EffectSourceId, appliedBy?: string): boolean => {
  return state.effects.some(
    (e) =>
      e.sourceId === effectSourceId &&
      (e.rules.duration > 0 || e.rules.type === EffectKind.PERMANENT) &&
      (appliedBy === undefined || e.appliedBy === appliedBy)
  );
};

export const hasBuilding = (state: LandState, buildingType: BuildingType): boolean => {
  return state.buildings.some((b) => b.type === buildingType);
};

/*
 * There are three type of getLands:
 * 1. getPlayerLands - return all lands controlled by player (realm + hostile)
 * 2. getRealmLands - return all lands in STRONGHOLD radius or have DEED_OF_RECLAMATION effect
 * 3. getHostileLands - return all lands controlled by player or allies outside owners STRONGHOLD radius
 */
export const getPlayerLands = (state: GameState, playerId?: string): LandState[] => {
  return getPlayer(state, playerId ?? state.turnOwner)
    .landsOwned.values()
    .toArray()
    .map((landId) => state.map.lands[landId]);
};

/**
 * return all lands controlled by all strongholds of the player or have DEED_OF_RECLAMATION effect
 **/
export const getRealmLands = (state: GameState): LandState[] => {
  const realm = new Set<LandState>();

  const lands = getPlayerLands(state);
  // add all lands with DEED_OF_RECLAMATION effect
  lands.forEach((l) => {
    if (hasActiveEffect(l, TreasureName.DEED_OF_RECLAMATION)) {
      realm.add(l);
    }
  });
  const playerStrongholds = lands.filter((l) => hasBuilding(l, BuildingName.STRONGHOLD));

  playerStrongholds.forEach((s) =>
    getTilesInRadius(state.map.dimensions, s.mapPos, 1).forEach((pos) => realm.add(getLand(state, pos)))
  );
  return realm.values().toArray();
};

export const getHostileLands = (gameState: GameState): LandState[] => {
  const hostileLands = new Set<LandState>();

  const realmLands = getRealmLands(gameState).flatMap((l) => getLandId(l.mapPos));

  // get lands controlled by players but far from strongholds
  getPlayerLands(gameState)
    .filter((land) => !realmLands.includes(getLandId(land.mapPos)))
    .forEach((land) => hostileLands.add(land));

  // add lands far from strongholds but with an army but not controlled by player
  getArmiesByPlayer(gameState)
    .filter((a) => !realmLands.includes(getLandId(getPosition(a))))
    .map((a) => getLand(gameState, getPosition(a)))
    .forEach((land) => hostileLands.add(land));

  // get allies lands
  const allies = getPlayersByDiplomacy(gameState, [DiplomacyStatus.ALLIANCE]).map((p) => p.id);
  const alliesLands = allies.flatMap((p) => getPlayerLands(gameState, p));

  // return all hostile lands that are not controlled by player or allies
  alliesLands.forEach((land) => hostileLands.delete(land));
  return hostileLands.values().toArray();
};

export const calculateHexDistance = (
  dimensions: MapDimensions,
  startPoint: LandPosition,
  endPoint: LandPosition
): number => {
  if (!isValidPosition(dimensions, startPoint) || !isValidPosition(dimensions, endPoint)) return -1;

  let visited = new Set<LandPosition>();
  let queue: { pos: LandPosition; dist: number }[] = [];
  visited.add(startPoint);
  queue.push({ pos: startPoint, dist: 0 });

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.pos.row === endPoint.row && current.pos.col === endPoint.col) {
      return current.dist;
    }
    const neighbours = getValidNeighbors(dimensions, current.pos);

    for (let neighbour of neighbours) {
      if (!Array.from(visited).some((n) => n.row === neighbour.row && n.col === neighbour.col)) {
        queue.push({ pos: neighbour, dist: current.dist + 1 });
        visited.add(neighbour);
      }
    }
  }
  return -1; // should never reach here
};

export const findShortestPath = (
  dimensions: MapDimensions,
  startPosition: LandPosition,
  endPosition: LandPosition
): LandPosition[] => {
  if (!isValidPosition(dimensions, startPosition) || !isValidPosition(dimensions, endPosition)) {
    return [];
  }

  // If start and end are the same position
  if (startPosition.row === endPosition.row && startPosition.col === endPosition.col) {
    return [startPosition];
  }

  const visited = new Set<string>();
  const queue: { pos: LandPosition; path: LandPosition[] }[] = [];

  visited.add(getLandId(startPosition));
  queue.push({ pos: startPosition, path: [startPosition] });

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check if we reached the destination
    if (current.pos.row === endPosition.row && current.pos.col === endPosition.col) {
      return current.path;
    }

    const neighbors = getValidNeighbors(dimensions, current.pos);

    for (const neighbor of neighbors) {
      const neighborKey = getLandId(neighbor);

      if (!visited.has(neighborKey)) {
        //const weight = 1; // Can be modified later for different terrain costs
        const newPath = [...current.path, neighbor];

        queue.push({ pos: neighbor, path: newPath });
        visited.add(neighborKey);
      }
    }
  }
  // No path found
  return [];
};

const excludePosition = (arr: LandPosition[], exclude: LandPosition): LandPosition[] => {
  return arr.filter((pos) => !(pos.row === exclude.row && pos.col === exclude.col));
};

export const getTilesInRadius = (
  dimensions: MapDimensions,
  center: LandPosition,
  radius: number,
  excludeCenter: boolean = false
): LandPosition[] => {
  if (!isValidPosition(dimensions, center) || radius < 0) return [];

  const queue: { pos: LandPosition; dist: number }[] = [];
  const tilesInRadius: LandPosition[] = [center];

  if (radius === 0) return tilesInRadius;
  if (radius === 1) {
    tilesInRadius.push(...getValidNeighbors(dimensions, center));
    return excludeCenter ? excludePosition(tilesInRadius, center) : tilesInRadius;
  }

  queue.push({ pos: center, dist: 0 });

  while (queue.length > 0) {
    const current = queue.shift()!;

    const neighbours = getValidNeighbors(dimensions, current.pos);

    for (let neighbour of neighbours) {
      if (
        !Array.from(tilesInRadius).some((n) => n.row === neighbour.row && n.col === neighbour.col) &&
        current.dist + 1 <= radius
      ) {
        queue.push({ pos: neighbour, dist: current.dist + 1 });
        tilesInRadius.push(neighbour);
      }
    }
  }
  return excludeCenter ? excludePosition(tilesInRadius, center) : tilesInRadius;
};

const isValidPosition = (dimensions: MapDimensions, pos: LandPosition): boolean => {
  const { rows, cols } = dimensions;
  if (pos.row < 0 || pos.row >= rows) return false;
  const colsInRow = pos.row % 2 === 0 ? cols : cols - 1;
  return pos.col >= 0 && pos.col < colsInRow;
};

const getValidNeighbors = (dimensions: MapDimensions, pos: LandPosition): LandPosition[] => {
  return getHexNeighbors(pos).filter((pos) => isValidPosition(dimensions, pos));
};

/** Get neighbors for hexagonal grid (offset coordinates)
 * @param pos - position to get neighbors for
 */
const getHexNeighbors = (pos: LandPosition): LandPosition[] => {
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
