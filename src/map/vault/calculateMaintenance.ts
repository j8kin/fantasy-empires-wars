import { getPlayerLands } from '../../selectors/landSelectors';
import { getArmiesByPlayer } from '../../selectors/armySelectors';
import { getBuildingInfo } from '../../domain/building/buildingRepository';
import { getRecruitInfo } from '../../domain/unit/unitRepository';

import type { GameState } from '../../state/GameState';

export const calculateMaintenance = (gameState: GameState): number => {
  const { turnOwner } = gameState;

  // building maintenance
  const buildingMaintenance = getPlayerLands(gameState)
    .filter((l) => l.buildings.length > 0)
    .reduce((acc, land) => {
      return (
        acc +
        land.buildings.reduce(
          (acc, building) => acc + getBuildingInfo(building.type).maintainCost,
          0
        )
      );
    }, 0);

  // army maintenance
  const armyMaintenance = getArmiesByPlayer(gameState, turnOwner).reduce((acc, army) => {
    return (
      acc +
      army.heroes.reduce((acc, unit) => acc + unit.cost, 0) +
      army.regulars.reduce((acc, unit) => acc + unit.cost * unit.count, 0) +
      army.warMachines.reduce(
        (acc, unit) => acc + getRecruitInfo(unit.type).maintainCost * unit.count,
        0
      )
    );
  }, 0);

  return Math.ceil(buildingMaintenance + armyMaintenance);
};
