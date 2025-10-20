import { GameState } from '../../types/GameState';
import { GamePlayer, PlayerInfo } from '../../types/GamePlayer';

import { getLands } from '../utils/mapLands';

import { BuildingType } from '../../types/Building';
import { Unit } from '../../types/Army';

const unitMaintenanceCost = (unit: Unit): number => {
  if (unit.hero) {
    return unit.maintainCost * (Math.floor(unit.level / 4) + 1);
  }

  switch (unit.level) {
    case 2: // veteran unit
      return unit.maintainCost * 1.5;
    case 3: // elite unit
      return unit.maintainCost * 2;
    default:
      return unit.maintainCost;
  }
};

export const calculateMaintenance = (gameState: GameState, player: PlayerInfo) => {
  // building maintenance
  const buildingMaintenance = getLands(
    gameState.battlefield.lands,
    [player],
    undefined,
    undefined,
    Object.values(BuildingType)
  ).reduce((acc, land) => {
    return acc + land.buildings.reduce((acc, building) => acc + building.maintainCost, 0);
  }, 0);

  // army maintenance
  const armyMaintenance = getLands(
    gameState.battlefield.lands,
    [player],
    undefined,
    undefined,
    undefined,
    false
  ).reduce((acc, army) => {
    return (
      acc +
      army.army.reduce((acc, units) => {
        return acc + units.quantity * unitMaintenanceCost(units.unit);
      }, 0)
    );
  }, 0);

  return Math.ceil(buildingMaintenance + armyMaintenance);
};
