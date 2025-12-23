import { getLandId } from '../state/map/land/LandId';
import { getTurnOwner } from './playerSelectors';
import { isMageType } from '../domain/unit/unitTypeChecks';
import type { GameState } from '../state/GameState';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { ArmyBriefInfo, ArmyState } from '../state/army/ArmyState';
import type { HeroState } from '../state/army/HeroState';
import type { HeroUnitType } from '../types/UnitType';
import type { TreasureType } from '../types/Treasures';

// Army state selectors (operating on individual army objects)
export const briefInfo = (state: ArmyState): ArmyBriefInfo => {
  return {
    heroes: state.heroes.map((h) => ({ name: h.name, type: h.type, level: h.level })),
    regulars: state.regulars.map((u) => ({ id: u.type, rank: u.rank, count: u.count })),
  };
};

export const isMoving = (state: ArmyState): boolean => {
  return state.movement.path.length !== 1;
};

export const getPosition = (state: ArmyState): LandPosition =>
  state.movement.path[state.movement.progress];

// GameState army selectors (operating on the entire game state)
/**
 * Get all armies at a specific land position
 */
export const getArmiesAtPosition = (gameState: GameState, position: LandPosition): ArmyState[] => {
  return gameState.armies.filter((army) => {
    if (isMoving(army)) {
      // For moving armies, check if they're currently at this position in their path
      return (
        army.movement.path.length > army.movement.progress &&
        getLandId(army.movement.path[army.movement.progress]) === getLandId(position)
      );
    } else {
      // For stationary armies, check if they're stationed at this position
      return (
        army.movement.path.length > 0 && getLandId(army.movement.path[0]) === getLandId(position)
      );
    }
  });
};

/**
 * Get armies controlled by specific players at a position
 */
export const getArmiesAtPositionByPlayers = (
  gameState: GameState,
  position: LandPosition,
  players: string[]
): ArmyState[] => {
  return getArmiesAtPosition(gameState, position).filter((army) =>
    players.includes(army.controlledBy)
  );
};

/**
 * Check if a land position has any armies by related player(s)
 */
export const hasArmiesAtPositionByPlayer = (
  gameState: GameState,
  position: LandPosition,
  players?: string[]
): boolean => {
  return (
    getArmiesAtPositionByPlayers(gameState, position, players ?? [gameState.turnOwner]).length > 0
  );
};

/**
 * Get all armies controlled by a specific player
 */
export const getArmiesByPlayer = (gameState: GameState, playerId?: string): ArmyState[] => {
  return gameState.armies.filter((army) => army.controlledBy === (playerId ?? gameState.turnOwner));
};

/**
 * Find an army by ID
 */
export const findArmyById = (gameState: GameState, armyId: string): ArmyState | undefined => {
  return gameState.armies.find((army) => army.id === armyId);
};

/**
 * Get moving armies
 */
export const getMovingArmies = (gameState: GameState): ArmyState[] => {
  return gameState.armies.filter(isMoving);
};

/**
 * Get stationary armies
 */
export const getStationaryArmies = (gameState: GameState, playerId?: string): ArmyState[] => {
  return gameState.armies.filter(
    (army) => !isMoving(army) && (!playerId || army.controlledBy === playerId)
  );
};

export const hasArtifact = (hero: HeroState, artifact: TreasureType): boolean => {
  return hero.artifacts.some((a) => a.treasure.type === artifact);
};

export const getMaxHeroLevelByType = (gameState: GameState, heroType: HeroUnitType): number => {
  return Math.max(
    ...getArmiesByPlayer(gameState).flatMap((army) =>
      army.heroes.filter((h) => h.type === heroType).map((hero) => hero.level)
    ),
    ...getTurnOwner(gameState)
      .quests.filter((h) => h.hero.type === heroType)
      .map((q) => q.hero.level),
    0 // if no related Mages return 0 to allow casting spells even if no heroes (all just die but mana exists)
  );
};
/**
 * Find the land position where a hero with the given name is located
 */
export const findLandByHeroName = (
  gameState: GameState,
  heroName: string,
  playerId?: string
): LandPosition | undefined => {
  const armies = playerId ? getArmiesByPlayer(gameState, playerId) : gameState.armies;

  for (const army of armies) {
    const hero = army.heroes.find((h) => h.name === heroName);
    if (hero) {
      // Get the current position from the army's movement path
      if (isMoving(army)) {
        // For moving armies, get current position based on progress
        return army.movement.path.length > army.movement.progress
          ? army.movement.path[army.movement.progress]
          : army.movement.path[army.movement.path.length - 1];
      } else {
        // For stationary armies, get the first position in path
        return army.movement.path.length > 0 ? army.movement.path[0] : undefined;
      }
    }
  }

  return undefined;
};

export const findArmyByHero = (state: GameState, heroName: string, playerId?: string) => {
  return getArmiesByPlayer(state, playerId).find((a) => a.heroes.some((h) => h.name === heroName));
};
/**
 * Retrieves a list of all hero units in the game include heroes in Quest.
 *
 * @function
 * @param gameState - The current game state.
 * @param {boolean} [isMageUnit] - Optional parameter to filter hero units:
 *    If true, only mage units are retrieved.
 *    If false, then non-mage units returned
 *    If not specified, all units are returned.
 * @returns {HeroState[]} An array of hero units. The array can be empty if no heroes are available or match the specified criteria.
 */
export const getAllHeroes = (gameState: GameState, isMageUnit?: boolean): HeroState[] => {
  const turnOwner = getTurnOwner(gameState);

  // get all heroes in the battlefield
  const allHeroes = findAllHeroesOnMap(gameState).map((h) => h.hero);
  // add all heroes in a quest
  allHeroes.push(...turnOwner.quests.flatMap((q) => q.hero));

  return allHeroes.filter((h) =>
    isMageUnit == null ? h : isMageUnit ? isMageType(h.type) : !isMageType(h.type)
  );
};

export const findAllHeroesOnMap = (
  gameState: GameState,
  playerId?: string,
  moving: boolean = false
) => {
  return getArmiesByPlayer(gameState, playerId ?? gameState.turnOwner)
    .filter((a) => isMoving(a) === moving)
    .flatMap((army) =>
      army.heroes.flatMap((hero) => ({
        hero: hero,
        position: getPosition(army),
      }))
    );
};
