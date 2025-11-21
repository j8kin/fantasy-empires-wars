import { GameState, TurnPhase } from '../../state/GameState';
import { LandPosition } from '../../state/LandState';

import { HeroUnit, isHero, RegularUnit, Unit } from '../../types/Army';

import { findShortestPath } from '../utils/mapAlgorithms';
import { getLand } from '../utils/getLands';

export const MIN_HERO_PACKS = 10;

export const startMovement = (
  from: LandPosition,
  to: LandPosition,
  units: Unit[],
  gameState: GameState
) => {
  if (gameState == null || gameState.turnPhase !== TurnPhase.MAIN) return;

  // Hero units could move on hostile territories only with Regular units or if there are move then 10 heroes are moved
  if (
    getLand(gameState, to).controlledBy !== gameState.turnOwner &&
    units.every(isHero) &&
    units.length < MIN_HERO_PACKS
  ) {
    return;
  }

  // expect that there is a stationed army in from land
  const stationedArmy = getLand(gameState, from).army.filter((a) => a.movements == null);
  if (stationedArmy.length !== 1) {
    return; // fallback: it should be the only one stationed Army
  }
  // expect that there are enough units in stationed army to move
  for (const unit of units) {
    if (isHero(unit)) {
      if (!stationedArmy[0].units.some((u) => (u as HeroUnit).name === (unit as HeroUnit).name)) {
        return; // fallback: hero is not in the stationed army
      }
    } else {
      const regUnit = stationedArmy[0].units.find((u) => u.id === unit.id) as RegularUnit;
      if (regUnit == null || regUnit.count < (unit as RegularUnit).count) {
        return; // fallback: not enough units in the stationed army
      }
    }
  }

  // update stationed army: remove moved heroes and decrement regular units
  // 1) Remove all heroes from stationedArmy[0].units that have the same name as heroes in units
  const heroesToMove = new Set(units.filter((u) => isHero(u)).map((u) => (u as HeroUnit).name));
  if (heroesToMove.size > 0) {
    stationedArmy[0].units = stationedArmy[0].units.filter(
      (u) => !isHero(u) || !heroesToMove.has((u as HeroUnit).name)
    );
  }

  // 2) For regular units: decrement count by the count in units; if becomes 0, remove the unit
  units.forEach((unit) => {
    if (!isHero(unit)) {
      const reg = unit as RegularUnit;
      const idx = stationedArmy[0].units.findIndex(
        (u) => !isHero(u) && (u as RegularUnit).id === reg.id
      );
      const stationedReg = stationedArmy[0].units[idx] as RegularUnit;
      const newCount = stationedReg.count - reg.count;
      if (newCount <= 0) {
        stationedArmy[0].units.splice(idx, 1);
      } else {
        stationedArmy[0].units[idx] = { ...stationedReg, count: newCount } as RegularUnit;
      }
    }
  });

  // remove stationed army from the land if it is empty
  getLand(gameState, from).army = getLand(gameState, from).army.filter((a) => a.units.length !== 0);

  // add a new army with movement to the land
  getLand(gameState, from).army.push({
    units: units,
    movements: {
      from: from,
      to: to,
      mp: 6,
      path: findShortestPath(gameState.battlefield.dimensions, from, to),
    },
    controlledBy: gameState.turnOwner,
  });
};
