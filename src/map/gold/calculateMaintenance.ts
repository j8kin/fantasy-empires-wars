import { GameState, getTurnOwner } from '../../types/GameState';
import { PlayerInfo } from '../../types/GamePlayer';

import { getLands } from '../utils/getLands';

import { BuildingType } from '../../types/Building';
import { HeroUnit, isHero, Unit, UnitRank } from '../../types/Army';

const unitMaintenanceCost = (unit: Unit): number => {
  if (isHero(unit)) {
    return unit.maintainCost * (Math.floor((unit as HeroUnit).level / 4) + 1);
  }

  switch (unit.level) {
    case UnitRank.VETERAN:
      return unit.maintainCost * (unit.count ?? 0) * 1.5;
    case UnitRank.ELITE:
      return unit.maintainCost * (unit.count ?? 0) * 2;
    case UnitRank.REGULAR:
      return unit.maintainCost * (unit.count ?? 0);
    default:
      return 0; // fallback should never happen
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
  }).reduce((acc, land) => {
    return (
      acc +
      land.army.reduce((acc, army) => {
        return acc + army.units.reduce((acc, unit) => acc + unitMaintenanceCost(unit), 0);
      }, 0)
    );
  }, 0);

  return Math.ceil(buildingMaintenance + armyMaintenance);
};
