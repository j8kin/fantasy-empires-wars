import { GameState, getTurnOwner } from '../state/GameState';

import { HeroOutcome } from '../types/HeroOutcome';
import { TreasureItem } from '../types/Treasures';

import { calculatePlayerIncome } from '../map/vault/calculatePlayerIncome';
import { placeHomeland } from '../map/generation/placeHomeland';
import { completeQuest } from '../map/quest/completeQuest';
import { completeRecruiting } from '../map/recruiting/completeRecruiting';
import { mergeArmies } from '../map/move-army/mergeArmies';
import { calculateAttritionPenalty } from '../map/move-army/calculateAttritionPenalty';
import { changeOwner } from '../map/move-army/changeOwner';
import { calculateMana } from '../map/magic/calculateMana';

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

  // due to Attrition penalty the whole army could die it means that territory should return to previous owner or became a neutral
  changeOwner(gameState);

  const questStatus = completeQuest(gameState);
  if (
    player.playerType === 'human' &&
    (questStatus.length > 0 || heroRecruitingStatus.length > 0)
  ) {
    onQuestResults?.([...questStatus, ...heroRecruitingStatus]);
  }

  // Calculate current player income for vault update and mana conversion
  const currentIncome = calculatePlayerIncome(gameState);

  // Handle empire treasure effects that have side effects (mana conversion)
  const hasObsidianChalice = player.empireTreasures?.some(
    (t) => t.id === TreasureItem.OBSIDIAN_CHALICE
  );

  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes’-Quests#-empire-artifacts-permanent
  // OBSIDIAN_CHALICE effect: convert 10% of income to 0.02% of black mana
  if (hasObsidianChalice) {
    // 10% reduction is already applied in `calculatePlayerIncome`
    player.mana.black = player.mana.black + currentIncome * 0.02;
  }

  // Update vault with current income after turn 2
  if (gameState.turn > 2) {
    player.vault += currentIncome;
  }

  // calculate Mana
  calculateMana(gameState);
};
