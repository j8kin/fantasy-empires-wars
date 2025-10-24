import { GameState, getTurnOwner } from '../types/GameState';
import { calculateIncome } from '../map/gold/calculateIncome';
import { calculateMaintenance } from '../map/gold/calculateMaintenance';
import { getLands } from '../map/utils/getLands';
import { ArmyUnit, getUnit } from '../types/Army';
import { BuildingType } from '../types/Building';
import { placeHomeland } from '../map/generation/placeHomeland';

export const startTurn = (gameState: GameState) => {
  if (!gameState.players.some((p) => p.id === gameState.turnOwner)) return;

  if (gameState.turn === 1) {
    // on first turn place players randomly on a map
    placeHomeland(gameState);
    return;
  }

  const player = getTurnOwner(gameState)!;
  // recruit units
  getLands({
    lands: gameState.battlefield.lands,
    players: [player],
    buildings: [
      BuildingType.BARRACKS,
      BuildingType.WHITE_MAGE_TOWER,
      BuildingType.BLACK_MAGE_TOWER,
      BuildingType.GREEN_MAGE_TOWER,
      BuildingType.BLUE_MAGE_TOWER,
      BuildingType.RED_MAGE_TOWER,
    ],
  }).forEach((l) =>
    l.buildings.forEach((b) => {
      if (b.slots) {
        b.slots.forEach((s) => {
          s.turnsRemaining--;
          if (s.turnsRemaining === 0) {
            l.army.push({ unit: getUnit(s.unit), quantity: s.count, moveInTurn: 0 });
          }
        });
        b.slots = b.slots.filter((s) => s.turnsRemaining > 0);
      }
    })
  );

  // complete army movement and merge ready armies
  getLands({ lands: gameState.battlefield.lands, players: [player], noArmy: false }).forEach(
    (land) => {
      land.army.filter((a) => a.moveInTurn > 0).forEach((a) => a.moveInTurn--);

      // merge armies of the same type and turnsUntilReady === 0 in one unit with summary quantity
      const readyArmies = land.army.filter((a) => a.moveInTurn === 0 && !a.unit.hero);
      const notReadyArmies = land.army.filter((a) => a.moveInTurn > 0 || a.unit.hero);

      const mergedArmies = readyArmies.reduce((acc: ArmyUnit[], army) => {
        const existing = acc.find((a) => a.unit.id === army.unit.id);
        if (existing) {
          existing.quantity += army.quantity;
        } else {
          acc.push({ ...army });
        }
        return acc;
      }, []);

      land.army = [...mergedArmies, ...notReadyArmies];
    }
  );

  // Calculate income based on current player's lands and army's
  const income = calculateIncome(gameState) - calculateMaintenance(gameState);
  // calculate income and update player#s money and income after turn 2
  if (gameState.turn > 2) {
    gameState.players.find((p) => p.id === player.id)!.money += income;
  }
  gameState.players.find((p) => p.id === player.id)!.income = income;
};
