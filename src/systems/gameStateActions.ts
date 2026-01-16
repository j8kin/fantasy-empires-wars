import { getLandId } from '../state/map/land/LandId';
import { getPlayer, getTurnOwner } from '../selectors/playerSelectors';
import { addEmpireTreasure } from './playerActions';
import { MAX_MANA } from '../types/Mana';
import type { GameState } from '../state/GameState';
import type { PlayerState } from '../state/player/PlayerState';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { BuildingState, RecruitmentSlot } from '../state/map/building/BuildingState';
import type { HeroQuest } from '../types/Quest';
import type { ManaType } from '../types/Mana';
import type { Effect } from '../types/Effect';
import type { EmpireTreasure } from '../types/Treasures';
import type { TurnPhaseType } from '../turn/TurnPhase';
import type { UnitType } from '../types/UnitType';

// ============================================================================
// TURN MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Update the current turn phase
 */
export const setTurnPhase = (gameState: GameState, phase: TurnPhaseType): GameState => {
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
export const updatePlayer = (gameState: GameState, playerId: string, updates: Partial<PlayerState>): GameState => {
  return {
    ...gameState,
    players: gameState.players.map((player) => (player.id === playerId ? { ...player, ...updates } : player)),
  };
};

/**
 * Update a player's vault (add or subtract gold)
 */
export const updatePlayerVault = (gameState: GameState, playerId: string, deltaVault: number): GameState => {
  return updatePlayer(gameState, playerId, {
    vault: getPlayer(gameState, playerId).vault + deltaVault,
  });
};

/**
 * Update a player's mana for a specific type
 */
export const updatePlayerMana = (
  gameState: GameState,
  playerId: string,
  manaType: ManaType,
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

export const updatePlayerEffect = (gameState: GameState, playerId: string, effect: Effect): GameState => {
  const player = getPlayer(gameState, playerId);
  const updatedEffects = [...player.effects, effect];
  return updatePlayer(gameState, playerId, { effects: updatedEffects });
};

// ============================================================================
// PLAYER LAND OWNERSHIP FUNCTIONS
// ============================================================================
/**
 * Add a land to a player's owned lands
 */
export const addPlayerLand = (gameState: GameState, playerId: string, landPos: LandPosition): GameState => {
  const player = getPlayer(gameState, playerId);
  const newLandsOwned = new Set(player.landsOwned);
  newLandsOwned.add(getLandId(landPos));

  return updatePlayer(gameState, playerId, { landsOwned: newLandsOwned });
};

/**
 * Remove a land from a player's owned lands
 */
export const removePlayerLand = (gameState: GameState, playerId: string, landPos: LandPosition): GameState => {
  const player = getPlayer(gameState, playerId);
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
export const addPlayerQuest = (gameState: GameState, quest: HeroQuest): GameState => {
  const player = getTurnOwner(gameState);
  return updatePlayer(gameState, player.id, {
    quests: [...player.quests, quest],
  });
};

/**
 * Update quest turns remaining for all player quests
 */
export const decrementQuestTurns = (gameState: GameState, playerId: string): GameState => {
  const player = getPlayer(gameState, playerId);
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
  const player = getPlayer(gameState, playerId);
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
  return updatePlayer(gameState, playerId, addEmpireTreasure(getPlayer(gameState, playerId), treasure));
};

// ============================================================================
// LAND MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Most generic low-level function to update land properties
 * @param gameState - Current game state
 * @param landPos - Position of the land
 * @param landUpdater - Function that takes current land state and returns updated land state
 */
const updateLandState = (
  gameState: GameState,
  landPos: LandPosition,
  landUpdater: (land: (typeof gameState.map.lands)[string]) => (typeof gameState.map.lands)[string]
): GameState => {
  const landId = getLandId(landPos);
  const land = gameState.map.lands[landId];
  const updatedLand = landUpdater(land);

  return {
    ...gameState,
    map: {
      ...gameState.map,
      lands: {
        ...gameState.map.lands,
        [landId]: updatedLand,
      },
    },
  };
};

/**
 * Add an effect to a specific land
 */
export const updateLandEffect = (gameState: GameState, landPos: LandPosition, effect: Effect): GameState => {
  return updateLandState(gameState, landPos, (land) => ({
    ...land,
    effects: [...land.effects, effect],
  }));
};

export const removeLandEffect = (state: GameState, landPos: LandPosition, effectId: string): GameState => {
  return updateLandState(state, landPos, (land) => ({
    ...land,
    effects: land.effects.filter((effect) => effect.id !== effectId),
  }));
};

/**
 * Update a specific land's properties
 */
export const updateLand = (
  gameState: GameState,
  landPos: LandPosition,
  updates: {
    corrupted?: boolean;
    goldPerTurn?: number;
  }
): GameState => {
  return updateLandState(gameState, landPos, (land) => ({
    ...land,
    ...(updates.corrupted !== undefined && { corrupted: updates.corrupted }),
    ...(updates.goldPerTurn !== undefined && { goldPerTurn: updates.goldPerTurn }),
  }));
};

/**
 * Low-level function to update buildings at a specific land
 * @param gameState - Current game state
 * @param landPos - Position of the land
 * @param buildingUpdater - Function that takes a building and returns updated building
 */
export const updateLandBuildings = (
  gameState: GameState,
  landPos: LandPosition,
  buildingUpdater: (building: BuildingState) => BuildingState
): GameState => {
  return updateLandState(gameState, landPos, (land) => ({
    ...land,
    buildings: land.buildings.map(buildingUpdater),
  }));
};

/**
 * Low-level function to update building slots at a specific land
 * Applies the slot transformer to all buildings at the land
 * @param gameState - Current game state
 * @param landPos - Position of the land
 * @param slotsTransformer - Function that takes slots array and returns updated slots array
 */
export const updateLandBuildingSlots = (
  gameState: GameState,
  landPos: LandPosition,
  slotsTransformer: (slots: RecruitmentSlot[]) => RecruitmentSlot[]
): GameState => {
  return updateLandBuildings(gameState, landPos, (building) => {
    if (building.slots.length === 0) {
      return building;
    }

    const updatedSlots = slotsTransformer(building.slots);

    return {
      ...building,
      slots: updatedSlots,
    };
  });
};

// ============================================================================
// BUILDING MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Add a building to a specific land
 */
export const addBuildingToLand = (gameState: GameState, landPos: LandPosition, building: BuildingState): GameState => {
  return updateLandState(gameState, landPos, (land) => ({
    ...land,
    buildings: [...land.buildings, building],
  }));
};

/**
 * Remove all buildings from a specific land
 */
export const clearLandBuildings = (gameState: GameState, landPos: LandPosition): GameState => {
  return updateLandState(gameState, landPos, (land) => ({
    ...land,
    buildings: [],
  }));
};

/**
 * Start recruitment in a specific building slot
 * Finds the first available slot and occupies it
 */
export const startRecruitmentInSlot = (
  gameState: GameState,
  landPos: LandPosition,
  building: BuildingState,
  unit: UnitType,
  turnsRemaining: number
): GameState => {
  return updateLandBuildings(gameState, landPos, (b) => {
    if (b.id !== building.id) {
      return b;
    }
    const slotTraits = getTurnOwner(gameState).traits.recruitmentSlots[building.type];
    // Find first available slot that supports this unit
    const slotIndex = b.slots.findIndex((s, i) => !s.isOccupied && slotTraits && slotTraits[i]?.has(unit));
    if (slotIndex === -1) {
      return b; // No available slots
    }

    const updatedSlots = b.slots.map((slot, i) =>
      i === slotIndex
        ? {
            isOccupied: true,
            unit,
            turnsRemaining,
          }
        : slot
    );

    return {
      ...b,
      slots: updatedSlots,
    };
  });
};

/**
 * Decrement recruitment slots turns remaining for a specific player's lands
 */
export const decrementPlayerRecruitmentSlots = (gameState: GameState, playerId: string): GameState => {
  const player = getPlayer(gameState, playerId);
  let updatedState = gameState;

  // Apply decrement to all lands owned by the player
  Array.from(player.landsOwned).forEach((landId) => {
    const landPos = gameState.map.lands[landId]?.mapPos;
    if (!landPos) return;

    updatedState = updateLandBuildingSlots(updatedState, landPos, (slots) =>
      slots.map((slot) =>
        slot.isOccupied
          ? {
              ...slot,
              turnsRemaining: slot.turnsRemaining - 1,
            }
          : slot
      )
    );
  });

  return updatedState;
};

/**
 * Free all completed recruitment slots (turns remaining === 0) from a specific player's buildings
 * Sets isOccupied to false for completed slots
 */
export const freePlayerCompletedRecruitmentSlots = (gameState: GameState, playerId: string): GameState => {
  const player = getPlayer(gameState, playerId);
  let updatedState = gameState;

  // Apply to all lands owned by the player
  Array.from(player.landsOwned).forEach((landId) => {
    const landPos = gameState.map.lands[landId]?.mapPos;
    if (!landPos) return;

    updatedState = updateLandBuildingSlots(updatedState, landPos, (slots) =>
      slots.map((slot) =>
        slot.isOccupied && slot.turnsRemaining === 0
          ? {
              ...slot,
              isOccupied: false,
            }
          : slot
      )
    );
  });

  return updatedState;
};
