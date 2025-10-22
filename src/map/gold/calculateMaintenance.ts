import { GameState, getTurnOwner } from '../../types/GameState';
import { PlayerInfo } from '../../types/GamePlayer';

import { getLands } from '../utils/getLands';

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

export const calculateMaintenance = (gameState: GameState): number => {
  const player: PlayerInfo = getTurnOwner(gameState) as PlayerInfo;
  if (player == null) return 0;

  // building maintenance
  const buildingMaintenance = getLands({
    lands: gameState.battlefield.lands,
    players: [player],
    buildings: Object.values(BuildingType),
  }).reduce((acc, land) => {
    return acc + land.buildings.reduce((acc, building) => acc + building.maintainCost, 0);
  }, 0);

  // army maintenance
  const armyMaintenance = getLands({
    lands: gameState.battlefield.lands,
    players: [player],
    noArmy: false,
  }).reduce((acc, army) => {
    return (
      acc +
      army.army.reduce((acc, units) => {
        return acc + units.quantity * unitMaintenanceCost(units.unit);
      }, 0)
    );
  }, 0);

  return Math.ceil(buildingMaintenance + armyMaintenance);
};
