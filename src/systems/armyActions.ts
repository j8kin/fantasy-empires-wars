import { move } from '../selectors/movementSelectors';
import { regularsFactory } from '../factories/regularsFactory';
import { findShortestPath } from '../map/utils/mapAlgorithms';

import { EffectType } from '../types/Effect';
import { RegularUnitType } from '../types/UnitType';
import type { GameState } from '../state/GameState';
import type { ArmyState } from '../state/army/ArmyState';
import type { HeroState } from '../state/army/HeroState';
import type { RegularsState, UnitRank } from '../state/army/RegularsState';
import type { LandPosition } from '../state/map/land/LandPosition';

export const addHero = (state: ArmyState, hero: HeroState): ArmyState => {
  return {
    ...state,
    heroes: [...state.heroes, hero],
  };
};

export const getHero = (
  state: ArmyState,
  name: string
): { updatedArmy: ArmyState; hero: HeroState } | undefined => {
  const heroIdx = state.heroes.findIndex((h) => h.name === name);
  if (heroIdx === -1) return undefined;
  const hero = state.heroes[heroIdx];
  const updatedArmy = {
    ...state,
    heroes: state.heroes.filter((h) => h.name !== name),
  };
  return { updatedArmy, hero };
};

export const addRegulars = (state: ArmyState, regulars: RegularsState): ArmyState => {
  const unitIdx = state.regulars.findIndex(
    (u) => u.type === regulars.type && u.rank === regulars.rank
  );
  if (unitIdx !== -1) {
    // Update existing unit count
    return {
      ...state,
      regulars: state.regulars.map((unit, idx) =>
        idx === unitIdx ? { ...unit, count: unit.count + regulars.count } : unit
      ),
    };
  } else {
    // Add new unit
    return {
      ...state,
      regulars: [...state.regulars, regulars],
    };
  }
};

export const getRegulars = (
  state: ArmyState,
  unitType: RegularUnitType,
  rank: UnitRank,
  count: number
): { updatedArmy: ArmyState; regulars: RegularsState } | undefined => {
  const unitIdx = state.regulars.findIndex(
    (u) => u.type === unitType && u.rank === rank && u.count >= count
  );
  if (unitIdx === -1) return undefined;
  const unit = state.regulars[unitIdx];

  if (unit.count === count) {
    // Remove the entire unit
    const updatedArmy = {
      ...state,
      regulars: state.regulars.filter((_, idx) => idx !== unitIdx),
    };
    return { updatedArmy, regulars: unit };
  } else {
    // Reduce the unit count
    const updatedArmy = {
      ...state,
      regulars: state.regulars.map((u, idx) =>
        idx === unitIdx ? { ...u, count: u.count - count } : u
      ),
    };
    const regularsToReturn = { ...regularsFactory(unit.type, count), rank: unit.rank };
    return { updatedArmy, regulars: regularsToReturn };
  }
};

export const mergeArmies = (target: ArmyState, source: ArmyState): ArmyState => {
  // Merge heroes
  const mergedHeroes = [...target.heroes, ...source.heroes];

  // Merge regulars
  const mergedRegulars = [...target.regulars];
  source.regulars.forEach((sourceUnit) => {
    const existingIdx = mergedRegulars.findIndex(
      (u) => u.type === sourceUnit.type && u.rank === sourceUnit.rank
    );
    if (existingIdx !== -1) {
      // Update existing unit count
      mergedRegulars[existingIdx] = {
        ...mergedRegulars[existingIdx],
        count: mergedRegulars[existingIdx].count + sourceUnit.count,
      };
    } else {
      // Add new unit
      mergedRegulars.push(sourceUnit);
    }
  });

  // Merge effects: combine all negative effects from both armies, positive effects disappear
  // prevent an abusing system when one unit split with good effect and combine with another huge army
  const allEffects = [...target.effects, ...source.effects];
  const mergedEffects = allEffects.filter((effect) => effect.rules.type === EffectType.NEGATIVE);

  return {
    ...target,
    heroes: mergedHeroes,
    regulars: mergedRegulars,
    effects: mergedEffects,
  };

  // source army should be removed from storage separately by removeArmy
};

export const startMoving = (state: ArmyState, to: LandPosition): void => {
  const from = state.movement.path[state.movement.progress];
  state.movement.path = findShortestPath({ rows: 100, cols: 100 }, from, to);
};

export const moveArmy = (state: ArmyState): void => {
  move(state.movement);
};

// GameState-level army operations
/**
 * Add an army to GameState
 */
export const addArmyToGameState = (gameState: GameState, army: ArmyState): GameState => {
  return {
    ...gameState,
    armies: [...gameState.armies, army],
  };
};

/**
 * Remove an army from GameState by ID
 */
export const removeArmyFromGameState = (gameState: GameState, armyId: string): GameState => {
  return {
    ...gameState,
    armies: gameState.armies.filter((army) => army.id !== armyId),
  };
};

/**
 * Remove all armies from GameState that don't have any regulars or heroes
 */
export const cleanupArmies = (gameState: GameState): GameState => {
  const validArmies = gameState.armies.filter(
    (army) => army.regulars.length > 0 || army.heroes.length > 0
  );
  return { ...gameState, armies: validArmies };
};

/**
 * Update an army in GameState
 */
export const updateArmyInGameState = (gameState: GameState, updatedArmy: ArmyState): GameState => {
  return {
    ...gameState,
    armies: gameState.armies.map((army) => (army.id === updatedArmy.id ? updatedArmy : army)),
  };
};
