import { GameState, getTurnOwner } from '../types/GameState';
import { calculateIncome } from '../map/gold/calculateIncome';
import { calculateMaintenance } from '../map/gold/calculateMaintenance';
import { placeHomeland } from '../map/generation/placeHomeland';
import { completeQuest } from '../map/quest/completeQuest';
import { completeRecruiting } from '../map/recruiting/completeRecruiting';
import { HeroOutcome } from '../types/HeroOutcome';
import { mergeArmies } from '../map/move-army/mergeArmies';
import { calculateAttritionPenalty } from '../map/move-army/calculateAttritionPenalty';

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

  // merge armies after recruiting since after recruiting the army it could be on the same land as just arrived army
  mergeArmies(gameState);

  // calculate attrition penalty after merge armies and player receive turn and all battles are ower and all movements are done
  calculateAttritionPenalty(gameState);

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
