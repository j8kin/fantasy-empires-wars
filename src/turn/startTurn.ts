import { GameState, getTurnOwner } from '../types/GameState';
import { calculateIncome } from '../map/gold/calculateIncome';
import { calculateMaintenance } from '../map/gold/calculateMaintenance';
import { getLands } from '../map/utils/getLands';
import { Army, isHero, RegularUnit } from '../types/Army';
import { placeHomeland } from '../map/generation/placeHomeland';
import { completeQuest } from '../map/quest/completeQuest';
import { completeRecruiting } from '../map/recruiting/completeRecruiting';
import { HeroOutcome } from '../types/HeroOutcome';

export const startTurn = (
  gameState: GameState,
  onQuestResults?: (results: HeroOutcome[]) => void
) => {
  if (!gameState.players.some((p) => p.id === gameState.turnOwner)) return;

  if (gameState.turn === 1) {
    // on first turn place players randomly on a map
    placeHomeland(gameState);
    return;
  }

  const player = getTurnOwner(gameState)!;
  // recruit units
  const heroRecruitingStatus = completeRecruiting(gameState);

  // complete army movement and merge ready armies
  getLands({ lands: gameState.battlefield.lands, players: [player], noArmy: false }).forEach(
    (land) => {
      land.army.filter((a) => a.isMoving).forEach((a) => (a.isMoving = false));

      // merge armies of the same type and turnsUntilReady === 0 in one unit with summary quantity
      // Heroes should never be merged since they are unique individuals
      const readyRegularUnits = land.army.filter((a) => !a.isMoving && !isHero(a.units));
      const heroUnits = land.army.filter((a) => !a.isMoving && isHero(a.units));
      const notReadyArmies = land.army.filter((a) => a.isMoving);

      const mergedRegularUnits = readyRegularUnits.reduce((acc: Army[], army) => {
        const existing: RegularUnit = acc.find(
          // merge units the same type and level (regular/veteran and elite units should not merge with each other)
          (a) => a.units.id === army.units.id && a.units.level === army.units.level
        )?.units as RegularUnit;
        if (existing) {
          existing.count += (army.units as RegularUnit).count;
        } else {
          acc.push({ ...army });
        }
        return acc;
      }, []);

      land.army = [...mergedRegularUnits, ...heroUnits, ...notReadyArmies];
    }
  );

  const questStatus = completeQuest(gameState);
  if (
    getTurnOwner(gameState)?.playerType === 'human' &&
    (questStatus.length > 0 || heroRecruitingStatus.length > 0)
  ) {
    onQuestResults?.([...questStatus, ...heroRecruitingStatus]);
  }

  // Calculate income based on current player's lands and army's
  const income = calculateIncome(gameState) - calculateMaintenance(gameState);
  // calculate income and update player#s money and income after turn 2
  if (gameState.turn > 2) {
    gameState.players.find((p) => p.id === player.id)!.vault += income;
  }
  gameState.players.find((p) => p.id === player.id)!.income = income;
};
