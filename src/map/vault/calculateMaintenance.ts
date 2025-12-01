import { GameState } from '../../state/GameState';

import { getPlayerLands } from '../../selectors/playerSelectors';
import { getArmiesByPlayer } from '../utils/armyUtils';

export const calculateMaintenance = (gameState: GameState): number => {
  const { turnOwner } = gameState;

  // building maintenance
  const buildingMaintenance = getPlayerLands(gameState)
    .filter((l) => l.buildings.length > 0)
    .reduce((acc, land) => {
      return acc + land.buildings.reduce((acc, building) => acc + building.maintainCost, 0);
    }, 0);

  // army maintenance
  const armyMaintenance = getArmiesByPlayer(gameState, turnOwner).reduce((acc, army) => {
    return (
      acc +
      army.heroes.reduce((acc, unit) => acc + unit.baseStats.maintainCost, 0) +
      army.regulars.reduce((acc, unit) => acc + unit.baseStats.maintainCost * unit.count, 0)
    );
  }, 0);

  return Math.ceil(buildingMaintenance + armyMaintenance);
};
