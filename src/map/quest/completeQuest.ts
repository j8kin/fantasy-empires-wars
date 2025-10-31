import { GameState, getTurnOwner, TurnPhase } from '../../types/GameState';
import { HeroQuest, questLevel, QuestType } from './Quest';
import { getRandomElement } from '../../types/getRandomElement';
import { Artifact, artifacts, items, relicts } from '../../types/Treasures';
import {
  emptyHanded,
  heroDieMessage,
  heroGainArtifact,
  heroGainItem,
  heroGainRelic,
} from './questCompleteMessages';
import { HeroUnit } from '../../types/Army';
import { GamePlayer } from '../../types/GamePlayer';
import { getLand } from '../utils/getLands';

const surviveInQuest = (quest: HeroQuest): boolean => {
  return Math.random() <= 0.8 + (quest.hero.level - 1 - (questLevel(quest.id) - 1) * 5) * 0.05;
};

const calculateReward = (hero: HeroUnit, quest: HeroQuest, gameState: GameState): string => {
  if (Math.random() > 0.55 - 0.05 * (questLevel(quest.id) - 1)) {
    return emptyHanded(quest.hero.name);
  }
  const treasureType = Math.random();
  const player = getTurnOwner(gameState)!;

  switch (quest.id) {
    case 'The Echoing Ruins':
      return gainArtifact(hero, quest.id);

    case 'The Whispering Grove':
      return treasureType <= 0.3 ? gainItem(player, hero) : gainArtifact(hero, quest.id);

    case 'The Abyssal Crypt':
      if (treasureType <= 0.2) {
        return gainRelic(gameState, hero);
      } else if (treasureType <= 0.55) {
        return gainItem(player, hero);
      } else {
        return gainArtifact(hero, quest.id);
      }
    case 'The Shattered Sky':
      return treasureType <= 0.4
        ? gainRelic(gameState, hero)
        : gainItem(getTurnOwner(gameState)!, hero);
  }
};

const gainArtifact = (hero: HeroUnit, questType: QuestType): string => {
  const baseArtifactLevel = questLevel(questType);
  const heroArtifact: Artifact = {
    ...getRandomElement(artifacts),
    level: getRandomElement([baseArtifactLevel, baseArtifactLevel + 1, baseArtifactLevel + 2]),
  };
  // todo if hero already has artifact, then allow user to choose between two artifacts
  hero.artifacts.push(heroArtifact);
  return heroGainArtifact(hero.name, heroArtifact);
};

const gainItem = (player: GamePlayer, hero: HeroUnit): string => {
  const item = getRandomElement(items);
  if (item.charge == null) {
    item.charge = getRandomElement([7, 10, 15]);
  }
  player.empireTreasures.push(item);
  return heroGainItem(hero.name, item);
};

const gainRelic = (gameState: GameState, hero: HeroUnit): string => {
  const relicInPlay = gameState.players.flatMap((p) => p.empireTreasures);
  const availableRelics = relicts
    .filter((a) => a.alignment == null || a.alignment === getTurnOwner(gameState)?.alignment)
    .filter((a) => !relicInPlay.some((r) => r.id === a.id));

  if (availableRelics.length > 0) {
    const relic = getRandomElement(availableRelics);
    getTurnOwner(gameState)?.empireTreasures.push(relic);
    return heroGainRelic(hero.name, relic);
  } else {
    return gainItem(getTurnOwner(gameState)!, hero);
  }
};

const questResults = (quest: HeroQuest, gameState: GameState): string => {
  let questMessage: string;

  if (
    // player survived quest
    surviveInQuest(quest) &&
    // and player still controls the land where quest is
    getLand(gameState, quest.land).controlledBy === gameState.turnOwner
  ) {
    const hero = quest.hero;

    if (hero.level < questLevel(quest.id) * 5) {
      hero.level++;
    }

    questMessage = calculateReward(hero, quest, gameState);

    // return hero to quest land (with artifact if the hero gain it) that is why it is after calculateReward
    getLand(gameState, quest.land).army.push({
      unit: hero,
      isMoving: false,
    });
  } else {
    questMessage = heroDieMessage(quest.hero.name);
  }

  return questMessage;
};

export const completeQuest = (gameState: GameState): string[] => {
  if (gameState.turnPhase !== TurnPhase.START) return [];

  // decrease turnsByQuest counter
  getTurnOwner(gameState)?.quests.forEach((quest) => {
    quest.remainTurnsInQuest--;
  });

  // complete quests
  const status = getTurnOwner(gameState)!
    .quests.filter((quest) => quest.remainTurnsInQuest === 0)
    .map((q) => questResults(q, gameState));

  // remove completed quests from quests array
  getTurnOwner(gameState)!.quests = getTurnOwner(gameState)!.quests.filter(
    (quest) => quest.remainTurnsInQuest > 0
  );

  return status;
};
