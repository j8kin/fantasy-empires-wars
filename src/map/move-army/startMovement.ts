import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { addHero, addRegulars, getHero, getRegulars, startMoving } from '../../systems/armyActions';

import { ArmyBriefInfo } from '../../state/army/ArmyState';
import { isMoving } from '../../selectors/armySelectors';
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
  const stationedArmy = getLand(gameState, from).army.filter((a) => !isMoving(a));
  if (stationedArmy.length !== 1) {
    return; // fallback: it should be the only one stationed Army
  }
  // expect that there are enough units in stationed army to move
  for (let i = 0; i < units.heroes.length; i++) {
    const hero = units.heroes[i];
    if (!stationedArmy[0].heroes.some((h) => h.name === hero.name)) {
      return; // fallback: hero is not in the stationed army
    }
  }

  for (let i = 0; i < units.regulars.length; i++) {
    const regular = units.regulars[i];
    if (
      !stationedArmy[0].regulars.some(
        (u) => u.type === regular.id && u.rank === regular.rank && u.count >= regular.count
      )
    ) {
      return; // fallback: not enough units in the stationed army
    }
  }

  // update stationed army: remove moved heroes and decrement regular units
  const movingArmy = armyFactory(gameState.turnOwner, from);
  units.heroes.forEach((hero) => addHero(movingArmy, getHero(stationedArmy[0], hero.name)!));
  units.regulars.forEach((regular) =>
    addRegulars(movingArmy, getRegulars(stationedArmy[0], regular.id, regular.rank, regular.count)!)
  );

  startMoving(movingArmy, to);

  // remove stationed army from the land if it is empty
  getLand(gameState, from).army = getLand(gameState, from).army.filter(
    (a) => a.regulars.length !== 0 || a.heroes.length !== 0
  );

  // add a new army with movement to the land
  getLand(gameState, from).army.push(movingArmy);
};
