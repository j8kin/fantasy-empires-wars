import { GameState } from '../state/GameState';

import { getTurnOwner, hasTreasureByPlayer } from '../selectors/playerSelectors';
import { updatePlayerVault, updatePlayerMana } from '../systems/gameStateActions';
import { decrementEffectDurations } from '../systems/effectActions';
import { TreasureType } from '../types/Treasures';

import { HeroOutcome } from '../types/HeroOutcome';
import { ManaType } from '../types/Mana';

import { calculatePlayerIncome } from '../map/vault/calculatePlayerIncome';
import { placeHomeland } from '../map/generation/placeHomeland';
import { completeQuest } from '../map/quest/completeQuest';
import { completeRecruiting } from '../map/recruiting/completeRecruiting';
import { mergeArmiesAtPositions } from '../map/move-army/mergeArmiesAtPositions';
import { calculateAttritionPenalty } from '../map/move-army/calculateAttritionPenalty';
import { changeOwner } from '../map/move-army/changeOwner';
import { calculateMana } from '../map/magic/calculateMana';

export const startTurn = (
  gameState: GameState,
  onQuestResults?: (results: HeroOutcome[]) => void
) => {
  if (gameState.turn === 1) {
    // on first turn place players randomly on a map
    placeHomeland(gameState);
    return;
  }

  const player = getTurnOwner(gameState);
  // recruit units
  const heroRecruitingStatus = completeRecruiting(gameState);

  // merge armies after recruiting since after recruiting the army it could be on the same land as just arrived army
  mergeArmiesAtPositions(gameState);

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
  const hasObsidianChalice = hasTreasureByPlayer(player, TreasureType.OBSIDIAN_CHALICE);

  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes'-Quests#-empire-artifacts-permanent
  // OBSIDIAN_CHALICE effect: convert 10% of income to 0.1% of black mana
  if (hasObsidianChalice) {
    // 10% reduction is already applied in `calculatePlayerIncome`
    Object.assign(
      gameState,
      updatePlayerMana(gameState, player.id, ManaType.BLACK, currentIncome * 0.001)
    );
  }

  // Update vault and mana after turn 2
  if (gameState.turn > 2) {
    Object.assign(gameState, updatePlayerVault(gameState, player.id, currentIncome));
    // calculate Mana
    Object.assign(gameState, calculateMana(gameState));
  }

  // Decrement effect durations at the end of the turn (after all effects are taken into account)
  decrementEffectDurations(gameState);
};
