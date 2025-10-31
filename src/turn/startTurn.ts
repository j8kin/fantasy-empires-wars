import { GameState, getTurnOwner } from '../types/GameState';
import { calculateIncome } from '../map/gold/calculateIncome';
import { calculateMaintenance } from '../map/gold/calculateMaintenance';
import { getLands } from '../map/utils/getLands';
import { ArmyUnit, RegularUnit } from '../types/Army';
import { placeHomeland } from '../map/generation/placeHomeland';
import { completeQuest } from '../map/quest/completeQuest';
import { completeRecruiting } from '../map/recruiting/completeRecruiting';

export const startTurn = (gameState: GameState) => {
  if (!gameState.players.some((p) => p.id === gameState.turnOwner)) return;

  if (gameState.turn === 1) {
    // on first turn place players randomly on a map
    placeHomeland(gameState);
    return;
  }

  const player = getTurnOwner(gameState)!;
  // recruit units
  completeRecruiting(gameState);

  // complete army movement and merge ready armies
  getLands({ lands: gameState.battlefield.lands, players: [player], noArmy: false }).forEach(
    (land) => {
      land.army.filter((a) => a.isMoving).forEach((a) => (a.isMoving = false));

      // merge armies of the same type and turnsUntilReady === 0 in one unit with summary quantity
      const readyArmies = land.army.filter((a) => !a.isMoving && typeof a.unit.level === 'number');
      const notReadyArmies = land.army.filter(
        (a) => a.isMoving || typeof a.unit.level !== 'number'
      );

      const mergedArmies = readyArmies.reduce((acc: ArmyUnit[], army) => {
        const existing: RegularUnit = acc.find((a) => a.unit.id === army.unit.id)
          ?.unit as RegularUnit;
        if (existing) {
          existing.count += (army.unit as RegularUnit).count;
        } else {
          acc.push({ ...army });
        }
        return acc;
      }, []);

      land.army = [...mergedArmies, ...notReadyArmies];
    }
  );

  const questStatus = completeQuest(gameState);
  if (questStatus.length > 0 && getTurnOwner(gameState)?.playerType === 'human') {
    // todo notify about Quests results via popup
  }

  // Calculate income based on current player's lands and army's
  const income = calculateIncome(gameState) - calculateMaintenance(gameState);
  // calculate income and update player#s money and income after turn 2
  if (gameState.turn > 2) {
    gameState.players.find((p) => p.id === player.id)!.vault += income;
  }
  gameState.players.find((p) => p.id === player.id)!.income = income;
};
