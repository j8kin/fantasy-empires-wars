import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { ArmyBriefInfo } from '../../state/army/ArmyState';

import { getLandOwner } from '../../selectors/landSelectors';
import { addHero, addRegulars, getHero, getRegulars, startMoving } from '../../systems/armyActions';
import { getArmiesAtPosition, isMoving } from '../../selectors/armySelectors';
import {
  addArmyToGameState,
  updateArmyInGameState,
  removeArmyFromGameState,
} from '../../systems/armyActions';

import { armyFactory } from '../../factories/armyFactory';

export const MIN_HERO_PACKS = 10;

export const startMovement = (
  from: LandPosition,
  to: LandPosition,
  units: ArmyBriefInfo,
  gameState: GameState
) => {
  // Hero units could move on hostile territories only with Regular units or if there are move then 10 heroes are moved
  if (
    getLandOwner(gameState, to) !== gameState.turnOwner &&
    units.regulars.length === 0 &&
    units.heroes.length < MIN_HERO_PACKS
  ) {
    return;
  }

  // expect that there is a stationed army in from land
  const stationedArmies = getArmiesAtPosition(gameState, from).filter(
    (a) => !isMoving(a) && a.controlledBy === gameState.turnOwner
  );
  if (stationedArmies.length !== 1) {
    return; // fallback: it should be the only one stationed Army
  }
  // todo refactor to use getStationedArmy
  const stationedArmy = stationedArmies[0];
  // expect that there are enough units in stationed army to move
  for (let i = 0; i < units.heroes.length; i++) {
    const hero = units.heroes[i];
    if (!stationedArmy.heroes.some((h) => h.name === hero.name)) {
      return; // fallback: hero is not in the stationed army
    }
  }

  for (let i = 0; i < units.regulars.length; i++) {
    const regular = units.regulars[i];
    if (
      !stationedArmy.regulars.some(
        (u) => u.type === regular.id && u.rank === regular.rank && u.count >= regular.count
      )
    ) {
      return; // fallback: not enough units in the stationed army
    }
  }

  // update stationed army: remove moved heroes and decrement regular units
  let movingArmy = armyFactory(gameState.turnOwner, from);

  // Add heroes to moving army and update stationed army
  units.heroes.forEach((hero) => {
    const heroResult = getHero(stationedArmy, hero.name)!;
    Object.assign(stationedArmy, heroResult.updatedArmy);
    movingArmy = addHero(movingArmy, heroResult.hero);
  });

  // Add regulars to moving army and update stationed army
  units.regulars.forEach((regular) => {
    const regularsResult = getRegulars(stationedArmy, regular.id, regular.rank, regular.count)!;
    Object.assign(stationedArmy, regularsResult.updatedArmy);
    movingArmy = addRegulars(movingArmy, regularsResult.regulars);
  });

  // Copy all effects from the stationed army to the moving army
  movingArmy = {
    ...movingArmy,
    effects: [...stationedArmy.effects],
  };

  startMoving(movingArmy, to);

  // remove stationed army from GameState if it is empty, otherwise update it
  if (stationedArmy.regulars.length === 0 && stationedArmy.heroes.length === 0) {
    Object.assign(gameState, removeArmyFromGameState(gameState, stationedArmy.id));
  } else {
    Object.assign(gameState, updateArmyInGameState(gameState, stationedArmy));
  }

  // add the new moving army to GameState
  Object.assign(gameState, addArmyToGameState(gameState, movingArmy));
};
