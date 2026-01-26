import {
  calculateHexDistance,
  findShortestPath,
  getLandOwner,
  getRealmLands,
  getTilesInRadius,
} from '../../selectors/landSelectors';
import { addHero, addRegulars, addWarMachines, getHero, getRegulars, getWarMachines } from '../../systems/armyActions';
import { getArmiesAtPosition, getPosition, isMoving } from '../../selectors/armySelectors';
import { addArmyToGameState, updateArmyInGameState, removeArmyFromGameState } from '../../systems/armyActions';
import { armyFactory } from '../../factories/armyFactory';
import { getTurnOwner, isPlayerDoctrine } from '../../selectors/playerSelectors';
import { setDiplomacyStatus } from '../../systems/playerActions';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { Doctrine } from '../../state/player/PlayerProfile';
import { NO_PLAYER } from '../../domain/player/playerRepository';
import { DiplomacyStatus } from '../../types/Diplomacy';
import { Alignment } from '../../types/Alignment';
import { MAX_DISTANCE_FROM_REALM } from './calcMaxMove';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { ArmyBriefInfo } from '../../state/army/ArmyState';

export const MIN_HERO_COMBINED_LEVEL_FOR_MOVEMENT = 20;

export const startMovement = (
  gameState: GameState,
  from: LandPosition,
  to: LandPosition,
  units: ArmyBriefInfo
): GameState => {
  const turnOwner = getTurnOwner(gameState);
  // DRIVEN Doctrine allow to move regular units only with hero
  if (isPlayerDoctrine(gameState, Doctrine.DRIVEN)) {
    if (units.regulars.length > 0 && units.heroes.length === 0) {
      // no movements possible
      return gameState;
    }
  }

  const toOwner = getLandOwner(gameState, to);

  // Check if destination is opponent's land
  if (toOwner !== gameState.turnOwner && toOwner !== NO_PLAYER.id) {
    const diplomacy = turnOwner.diplomacy[toOwner];

    // If no diplomacy or diplomacy is not WAR/ALLIANCE
    if (!diplomacy || (diplomacy.status !== DiplomacyStatus.WAR && diplomacy.status !== DiplomacyStatus.ALLIANCE)) {
      // Check if turn owner is CHAOTIC
      if (turnOwner.playerProfile.alignment === Alignment.CHAOTIC) {
        // CHAOTIC characters automatically declare WAR
        gameState = setDiplomacyStatus(gameState, turnOwner.id, toOwner, DiplomacyStatus.WAR);
      } else {
        // Non-CHAOTIC characters cannot move to opponent lands without WAR or ALLIANCE
        return gameState;
      }
    }
  }

  // expect that there is a stationed army in from land
  const stationedArmies = getArmiesAtPosition(gameState, from).filter(
    (a) => !isMoving(a) && a.controlledBy === gameState.turnOwner
  );
  if (stationedArmies.length !== 1) {
    return gameState; // fallback: it should be the only one stationed Army
  }

  // Hero units could move on hostile territories only with Regular units or if COMBINED HEROES LEVEL more than MIN_HERO_COMBINED_LEVEL_FOR_MOVEMENT
  if (toOwner !== gameState.turnOwner && (units.regulars.length === 0 || stationedArmies[0].regulars.length === 0)) {
    // calculate cumulative level of heroes planned to move
    const canMove = units.heroes.reduce((acc, hero) => acc + hero.level, 0) >= MIN_HERO_COMBINED_LEVEL_FOR_MOVEMENT;
    if (!canMove) {
      return gameState;
    }
    // verify to position from realm lands
    const mapDimensions = getMapDimensions(gameState);
    const realmBorderLands = getRealmLands(gameState).filter((land) =>
      getTilesInRadius(mapDimensions, land.mapPos, 1, true).some(
        (tile) => getLandOwner(gameState, tile) !== gameState.turnOwner
      )
    );
    if (
      realmBorderLands.every((land) => calculateHexDistance(mapDimensions, to, land.mapPos) > MAX_DISTANCE_FROM_REALM)
    ) {
      return gameState;
    }
  }

  let stationedArmy = stationedArmies[0];
  // expect that there are enough units in stationed army to move
  for (let i = 0; i < units.heroes.length; i++) {
    const hero = units.heroes[i];
    if (!stationedArmy.heroes.some((h) => h.name === hero.name)) {
      return gameState; // fallback: hero is not in the stationed army
    }
  }

  for (let i = 0; i < units.regulars.length; i++) {
    const regular = units.regulars[i];
    if (
      !stationedArmy.regulars.some((u) => u.type === regular.id && u.rank === regular.rank && u.count >= regular.count)
    ) {
      return gameState; // fallback: not enough units in the stationed army
    }
  }

  for (let i = 0; i < units.warMachines.length; i++) {
    const warMachine = units.warMachines[i];
    if (!stationedArmy.warMachines.some((u) => u.type === warMachine.type && u.count >= warMachine.count)) {
      return gameState; // fallback: not enough war machines in the stationed army
    }
  }

  // update stationed army: remove moved heroes and decrement regular units
  let movingArmy = armyFactory(gameState.turnOwner, from);

  // Add heroes to moving army and update stationed army
  units.heroes.forEach((hero) => {
    const heroResult = getHero(stationedArmy, hero.name)!;
    stationedArmy = heroResult.updatedArmy;
    movingArmy = addHero(movingArmy, heroResult.hero);
  });

  // Add regulars to moving army and update stationed army
  units.regulars.forEach((regular) => {
    const regularsResult = getRegulars(stationedArmy, regular.id, regular.rank, regular.count)!;
    stationedArmy = regularsResult.updatedArmy;
    movingArmy = addRegulars(movingArmy, regularsResult.regulars);
  });

  // Add war machines to moving army and update stationed army
  units.warMachines.forEach((warMachine) => {
    const warMachinesResult = getWarMachines(stationedArmy, warMachine.type, warMachine.count, warMachine.durability)!;
    stationedArmy = warMachinesResult.updatedArmy;
    movingArmy = addWarMachines(movingArmy, warMachinesResult.warMachines);
  });

  // Copy all effects from the stationed army to the moving army and update movement path
  movingArmy = {
    ...movingArmy,
    effects: [...stationedArmy.effects],
    movement: {
      ...movingArmy.movement,
      path: findShortestPath(getMapDimensions(gameState), getPosition(movingArmy), to),
    },
  };

  // Accumulate all state changes and apply once at the end
  let updatedState = gameState;

  // remove stationed army from GameState if it is empty, otherwise update it
  if (
    stationedArmy.regulars.length === 0 &&
    stationedArmy.heroes.length === 0 &&
    stationedArmy.warMachines.length === 0
  ) {
    updatedState = removeArmyFromGameState(updatedState, stationedArmy.id);
  } else {
    updatedState = updateArmyInGameState(updatedState, stationedArmy);
  }

  // add the new moving army to GameState
  updatedState = addArmyToGameState(updatedState, movingArmy);

  return updatedState;
};
