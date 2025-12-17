import { getLandId } from '../state/map/land/LandId';
import { getPlayer } from '../selectors/playerSelectors';
import { addEmpireTreasure } from './playerActions';
import { MAX_MANA } from '../types/Mana';

import type { GameState } from '../state/GameState';
import type { PlayerState } from '../state/player/PlayerState';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { Building } from '../types/Building';
import type { HeroQuest } from '../types/Quest';
import type { Mana } from '../types/Mana';
import type { Effect } from '../types/Effect';
import type { EmpireTreasure } from '../types/Treasures';
import type { TurnPhase } from '../turn/TurnPhase';
import type { UnitType } from '../types/UnitType';

interface BuildingSlot {
  unit: UnitType;
  turnsRemaining: number;
}

// ============================================================================
// TURN MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Update the current turn phase
 */
export const setTurnPhase = (gameState: GameState, phase: TurnPhase): GameState => {
  return {
    ...gameState,
    turnPhase: phase,
  };
};

/**
 * Update the current turn owner
 */
export const setTurnOwner = (gameState: GameState, playerId: string): GameState => {
  return {
    ...gameState,
    turnOwner: playerId,
  };
};

/**
 * Increment the turn counter
 */
export const incrementTurn = (gameState: GameState): GameState => {
  return {
    ...gameState,
    turn: gameState.turn + 1,
  };
};

// ============================================================================
// PLAYER MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Add a player to the game
 */
export const addPlayer = (gameState: GameState, player: PlayerState): GameState => {
  return {
    ...gameState,
    players: [...gameState.players, player],
  };
};

/**
 * Remove a player from the game
 */
export const removePlayer = (gameState: GameState, playerId: string): GameState => {
  return {
    ...gameState,
    players: gameState.players.filter((p) => p.id !== playerId),
  };
};

/**
 * Update a specific player's properties
 */
export const updatePlayer = (
  gameState: GameState,
  playerId: string,
  updates: Partial<PlayerState>
): GameState => {
  return {
    ...gameState,
    players: gameState.players.map((player) =>
      player.id === playerId ? { ...player, ...updates } : player
    ),
  };
};

/**
 * Update a player's vault (add or subtract gold)
 */
export const updatePlayerVault = (
  gameState: GameState,
  playerId: string,
  deltaVault: number
): GameState => {
  return updatePlayer(gameState, playerId, {
    vault: gameState.players.find((p) => p.id === playerId)!.vault + deltaVault,
  });
};

/**
 * Update a player's mana for a specific type
 */
export const updatePlayerMana = (
  gameState: GameState,
  playerId: string,
  manaType: keyof Mana,
  deltaMana: number
): GameState => {
  const player = getPlayer(gameState, playerId);
  const newMana = player.mana[manaType] + deltaMana;
  const updatedMana = {
    ...player.mana,
    [manaType]: newMana >= MAX_MANA ? MAX_MANA : newMana, // do not allow mana above 200
  };
  return updatePlayer(gameState, playerId, { mana: updatedMana });
};

export const updatePlayerEffect = (
  gameState: GameState,
  playerId: string,
  effect: Effect
): GameState => {
  const player = getPlayer(gameState, playerId);
  const updatedEffects = [...player.effects, effect];
  return updatePlayer(gameState, playerId, { effects: updatedEffects });
};

/**
 * Set a player's mana for a specific type (absolute value)
 */
export const setPlayerMana = (
  gameState: GameState,
  playerId: string,
  manaType: keyof Mana,
  manaValue: number
): GameState => {
  const player = gameState.players.find((p) => p.id === playerId)!;
  const updatedMana = {
    ...player.mana,
    [manaType]: manaValue,
  };
  return updatePlayer(gameState, playerId, { mana: updatedMana });
};

// ============================================================================
// PLAYER LAND OWNERSHIP FUNCTIONS
// ============================================================================

/**
 * Add a land to a player's owned lands
 */
export const addPlayerLand = (
  gameState: GameState,
  playerId: string,
  landPos: LandPosition
): GameState => {
  const player = gameState.players.find((p) => p.id === playerId)!;
  const newLandsOwned = new Set(player.landsOwned);
  newLandsOwned.add(getLandId(landPos));

  return updatePlayer(gameState, playerId, { landsOwned: newLandsOwned });
};

/**
 * Remove a land from a player's owned lands
 */
export const removePlayerLand = (
  gameState: GameState,
  playerId: string,
  landPos: LandPosition
): GameState => {
  const player = gameState.players.find((p) => p.id === playerId)!;
  const newLandsOwned = new Set(player.landsOwned);
  newLandsOwned.delete(getLandId(landPos));

  return updatePlayer(gameState, playerId, { landsOwned: newLandsOwned });
};

// ============================================================================
// QUEST MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Add a quest to a player's quest list
 */
export const addPlayerQuest = (
  gameState: GameState,
  playerId: string,
  quest: HeroQuest
): GameState => {
  const player = gameState.players.find((p) => p.id === playerId)!;
  return updatePlayer(gameState, playerId, {
    quests: [...player.quests, quest],
  });
};

/**
 * Update quest turns remaining for all player quests
 */
export const decrementQuestTurns = (gameState: GameState, playerId: string): GameState => {
  const player = gameState.players.find((p) => p.id === playerId)!;
  const updatedQuests = player.quests.map((quest) => ({
    ...quest,
    remainTurnsInQuest: quest.remainTurnsInQuest - 1,
  }));

  return updatePlayer(gameState, playerId, { quests: updatedQuests });
};

/**
 * Remove completed quests from a player
 */
export const removeCompletedQuests = (gameState: GameState, playerId: string): GameState => {
  const player = gameState.players.find((p) => p.id === playerId)!;
  const activeQuests = player.quests.filter((quest) => quest.remainTurnsInQuest > 0);

  return updatePlayer(gameState, playerId, { quests: activeQuests });
};

/**
 * Add an quest item or relict to a player's empire treasures
 */
export const addPlayerEmpireTreasure = (
  gameState: GameState,
  playerId: string,
  treasure: EmpireTreasure
): GameState => {
  return updatePlayer(
    gameState,
    playerId,
    addEmpireTreasure(getPlayer(gameState, playerId), treasure)
  );
};

// ============================================================================
// BUILDING MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Add a building to a specific land
 */
export const addBuildingToLand = (
  gameState: GameState,
  landPos: LandPosition,
  building: Building
): GameState => {
  const landId = getLandId(landPos);
  return {
    ...gameState,
    map: {
      ...gameState.map,
      lands: {
        ...gameState.map.lands,
        [landId]: {
          ...gameState.map.lands[landId],
          buildings: [...gameState.map.lands[landId].buildings, building],
        },
      },
    },
  };
};

/**
 * Remove all buildings from a specific land
 */
export const clearLandBuildings = (gameState: GameState, landPos: LandPosition): GameState => {
  const landId = getLandId(landPos);
  return {
    ...gameState,
    map: {
      ...gameState.map,
      lands: {
        ...gameState.map.lands,
        [landId]: {
          ...gameState.map.lands[landId],
          buildings: [],
        },
      },
    },
  };
};

/**
 * Add a recruitment slot to a building
 */
export const addRecruitmentSlot = (
  gameState: GameState,
  landPos: LandPosition,
  buildingIndex: number,
  slot: BuildingSlot
): GameState => {
  const landId = getLandId(landPos);
  const land = gameState.map.lands[landId];
  const building = land.buildings[buildingIndex];

  const updatedBuilding = {
    ...building,
    slots: building.slots ? [...building.slots, slot] : [slot],
  };

  const updatedBuildings = land.buildings.map((b, idx) =>
    idx === buildingIndex ? updatedBuilding : b
  );

  return {
    ...gameState,
    map: {
      ...gameState.map,
      lands: {
        ...gameState.map.lands,
        [landId]: {
          ...land,
          buildings: updatedBuildings,
        },
      },
    },
  };
};

/**
 * Update recruitment slot turns remaining
 */
export const decrementRecruitmentSlots = (
  gameState: GameState,
  landPos: LandPosition,
  buildingIndex: number
): GameState => {
  const landId = getLandId(landPos);
  const land = gameState.map.lands[landId];
  const building = land.buildings[buildingIndex];

  if (!building.slots) return gameState;

  const updatedSlots = building.slots.map((slot) => ({
    ...slot,
    turnsRemaining: slot.turnsRemaining - 1,
  }));

  const updatedBuilding = {
    ...building,
    slots: updatedSlots,
  };

  const updatedBuildings = land.buildings.map((b, idx) =>
    idx === buildingIndex ? updatedBuilding : b
  );

  return {
    ...gameState,
    map: {
      ...gameState.map,
      lands: {
        ...gameState.map.lands,
        [landId]: {
          ...land,
          buildings: updatedBuildings,
        },
      },
    },
  };
};

/**
 * Remove completed recruitment slots from a building
 */
export const removeCompletedRecruitmentSlots = (
  gameState: GameState,
  landPos: LandPosition,
  buildingIndex: number
): GameState => {
  const landId = getLandId(landPos);
  const land = gameState.map.lands[landId];
  const building = land.buildings[buildingIndex];

  if (!building.slots) return gameState;

  const activeSlots = building.slots.filter((slot) => slot.turnsRemaining > 0);

  const updatedBuilding = {
    ...building,
    slots: activeSlots,
  };

  const updatedBuildings = land.buildings.map((b, idx) =>
    idx === buildingIndex ? updatedBuilding : b
  );

  return {
    ...gameState,
    map: {
      ...gameState.map,
      lands: {
        ...gameState.map.lands,
        [landId]: {
          ...land,
          buildings: updatedBuildings,
        },
      },
    },
  };
};

/**
 * Decrement recruitment slots turns remaining for a specific player's lands
 */
export const decrementPlayerRecruitmentSlots = (
  gameState: GameState,
  playerId: string
): GameState => {
  const player = gameState.players.find((p) => p.id === playerId);
  if (!player) return gameState;

  const updatedLands = { ...gameState.map.lands };

  // Only iterate through lands owned by the specific player
  Array.from(player.landsOwned).forEach((landId) => {
    const land = updatedLands[landId];
    if (!land) return;

    const updatedBuildings = land.buildings.map((building) => {
      if (!building.slots || building.slots.length === 0) {
        return building;
      }

      const updatedSlots = building.slots.map((slot) => ({
        ...slot,
        turnsRemaining: slot.turnsRemaining - 1,
      }));

      return {
        ...building,
        slots: updatedSlots,
      };
    });

    updatedLands[landId] = {
      ...land,
      buildings: updatedBuildings,
    };
  });

  return {
    ...gameState,
    map: {
      ...gameState.map,
      lands: updatedLands,
    },
  };
};

/**
 * Remove all completed recruitment slots (turns remaining === 0) from a specific player's buildings
 */
export const removePlayerCompletedRecruitmentSlots = (
  gameState: GameState,
  playerId: string
): GameState => {
  const player = gameState.players.find((p) => p.id === playerId);
  if (!player) return gameState;

  const updatedLands = { ...gameState.map.lands };

  // Only iterate through lands owned by the specific player
  Array.from(player.landsOwned).forEach((landId) => {
    const land = updatedLands[landId];
    if (!land) return;

    const updatedBuildings = land.buildings.map((building) => {
      if (!building.slots || building.slots.length === 0) {
        return building;
      }

      const activeSlots = building.slots.filter((slot) => slot.turnsRemaining > 0);

      return {
        ...building,
        slots: activeSlots,
      };
    });

    updatedLands[landId] = {
      ...land,
      buildings: updatedBuildings,
    };
  });

  return {
    ...gameState,
    map: {
      ...gameState.map,
      lands: updatedLands,
    },
  };
};
