import { GameState } from '../../state/GameState';

import { getLands } from '../utils/getLands';

import { BuildingType } from '../../types/Building';
import { RegularUnit, UnitRank } from '../../types/RegularUnit';
import { HeroUnit } from '../../types/HeroUnit';
import { isHeroType } from '../../types/UnitType';
import { Unit } from '../../types/BaseUnit';

// todo move to HeroUnit and RegularUnit into levelUp functions
const unitMaintenanceCost = (unit: Unit): number => {
  if (isHeroType(unit.id)) {
    return unit.maintainCost * (Math.floor((unit as HeroUnit).level / 4) + 1);
  }

  const regularUnit = unit as RegularUnit;
  switch (regularUnit.rank) {
    case UnitRank.VETERAN:
      return regularUnit.maintainCost * regularUnit.count * 1.5;
    case UnitRank.ELITE:
      return regularUnit.maintainCost * regularUnit.count * 2;
    case UnitRank.REGULAR:
      return regularUnit.maintainCost * regularUnit.count;
    default:
      return 0; // fallback should never happen
  }
};

export const calculateMaintenance = (gameState: GameState): number => {
  const turnOwner = gameState.turnOwner.id;

  // building maintenance
  const buildingMaintenance = getLands({
    gameState: gameState,
    players: [turnOwner],
    buildings: Object.values(BuildingType),
  }).reduce((acc, land) => {
    return acc + land.buildings.reduce((acc, building) => acc + building.maintainCost, 0);
  }, 0);

  // army maintenance
  const armyMaintenance = getLands({
    gameState: gameState,
    players: [turnOwner],
    noArmy: false,
  }).reduce((acc, land) => {
    return (
      acc +
      land.army.reduce((acc, army) => {
        return (
          acc +
          army.heroes.reduce((acc, unit) => acc + unitMaintenanceCost(unit), 0) +
          army.regulars.reduce((acc, unit) => acc + unitMaintenanceCost(unit), 0)
        );
      }, 0)
    );
  }, 0);

  return Math.ceil(buildingMaintenance + armyMaintenance);
};
