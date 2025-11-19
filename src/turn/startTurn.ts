import { GameState, getTurnOwner } from '../types/GameState';
import { calculateIncome } from '../map/gold/calculateIncome';
import { calculateMaintenance } from '../map/gold/calculateMaintenance';
import { placeHomeland } from '../map/generation/placeHomeland';
import { completeQuest } from '../map/quest/completeQuest';
import { completeRecruiting } from '../map/recruiting/completeRecruiting';
import { HeroOutcome } from '../types/HeroOutcome';
import { mergeArmies } from '../map/move-army/mergeArmies';
import { calculateAttritionPenalty } from '../map/move-army/calculateAttritionPenalty';
import { changeOwner } from '../map/move-army/changeOwner';
import { calculateMana } from '../map/magic/calculateMana';
import { TreasureItem } from '../types/Treasures';

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

  // Calculate income based on current player's lands and army's
  player.income = calculateIncome(gameState) - calculateMaintenance(gameState);
  const hasObsidianChalice = player.empireTreasures?.some(
    (t) => t.id === TreasureItem.OBSIDIAN_CHALICE
  );
  const hasBannerOfUnity = player.empireTreasures?.some(
    (t) => t.id === TreasureItem.BANNER_OF_UNITY
  );

  // Empire treasures permanent effects:
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes’-Quests#-empire-artifacts-permanent
  player.income = hasBannerOfUnity ? Math.ceil(player.income * 1.25) : player.income;
  // see OBSIDIAN_CHALICE effect: convert 10% of income to 0.02% of black mana
  player.mana.black = hasObsidianChalice
    ? player.mana.black + player.income * 0.02
    : player.mana.black;
  player.income = hasObsidianChalice ? Math.ceil(player.income * 0.9) : player.income;

  // calculate income and update player#s money and income after turn 2
  if (gameState.turn > 2) {
    player.vault += player.income;
  }

  // calculate Mana
  calculateMana(gameState);
};
