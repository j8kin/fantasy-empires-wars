import { ArmyState } from '../state/army/ArmyState';
import { HeroState } from '../state/army/HeroState';
import { RegularsState, UnitRank } from '../state/army/RegularsState';
import { RegularUnitType } from '../types/UnitType';
import { LandPosition } from '../state/map/land/LandPosition';
import { GameState } from '../state/GameState';
import { startMovement } from './moveActions';
import { move } from '../selectors/movementSelectors';
import { regularsFactory } from '../factories/regularsFactory';

export const addHero = (state: ArmyState, hero: HeroState): void => {
  state.heroes.push(hero);
};

export const getHero = (state: ArmyState, name: string): HeroState | undefined => {
  const heroIdx = state.heroes.findIndex((h) => h.name === name);
  if (heroIdx === -1) return undefined;
  const hero = state.heroes[heroIdx];
  state.heroes.splice(heroIdx, 1);
  return hero;
};

export const addRegulars = (state: ArmyState, regulars: RegularsState): void => {
  const unitIdx = state.regulars.findIndex(
    (u) => u.type === regulars.type && u.rank === regulars.rank
  );
  if (unitIdx !== -1) {
    state.regulars[unitIdx].count += regulars.count;
  } else {
    state.regulars.push(regulars);
  }
};

export const getRegulars = (
  state: ArmyState,
  unitType: RegularUnitType,
  rank: UnitRank,
  count: number
): RegularsState | undefined => {
  const unitIdx = state.regulars.findIndex(
    (u) => u.type === unitType && u.rank === rank && u.count >= count
  );
  if (unitIdx === -1) return undefined;
  const unit = state.regulars[unitIdx];
  if (unit.count === count) {
    state.regulars.splice(unitIdx, 1);
    return unit;
  }
  state.regulars[unitIdx].count -= count;
  return regularsFactory(state.regulars[unitIdx].type, count);
};

export const mergeArmies = (target: ArmyState, source: ArmyState): void => {
  // heroes
  source.heroes.forEach((h) => target.heroes.push(h));

  // regulars
  source.regulars.forEach((unit) => {
    const existing = target.regulars.find((u) => u.type === unit.type && u.rank === unit.rank);
    if (existing) {
      existing.count += unit.count;
    } else {
      target.regulars.push(unit);
    }
  });

  // source army should be removed from storage separately by removeArmy
};

export const startMoving = (state: ArmyState, to: LandPosition): void => {
  startMovement(state.movement, to);
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
 * Update an army in GameState
 */
export const updateArmyInGameState = (gameState: GameState, updatedArmy: ArmyState): GameState => {
  return {
    ...gameState,
    armies: gameState.armies.map((army) => (army.id === updatedArmy.id ? updatedArmy : army)),
  };
};
