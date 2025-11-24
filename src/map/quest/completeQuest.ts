import { GameState } from '../../state/GameState';
import { getQuest, HeroQuest, QuestType } from '../../types/Quest';
import { getRandomElement } from '../../types/getRandomElement';
import { Artifact, artifacts, items, relicts } from '../../types/Treasures';
import { HeroUnit } from '../../types/HeroUnit';
import { HeroOutcome, HeroOutcomeType } from '../../types/HeroOutcome';
import {
  emptyHanded,
  heroDieMessage,
  heroGainArtifact,
  heroGainItem,
  heroGainRelic,
} from './questCompleteMessages';
import { PlayerState } from '../../state/PlayerState';

const surviveInQuest = (quest: HeroQuest): boolean => {
  return Math.random() <= 0.8 + (quest.hero.level - 1 - (quest.quest.level - 1) * 5) * 0.05;
};

const calculateReward = (hero: HeroUnit, quest: HeroQuest, gameState: GameState): HeroOutcome => {
  if (Math.random() > 0.55 - 0.05 * (quest.quest.level - 1)) {
    return {
      status: HeroOutcomeType.Neutral,
      message: emptyHanded(quest.hero.name),
    };
  }
  const treasureType = Math.random();
  const player = gameState.turnOwner;

  switch (quest.quest.id) {
    case 'The Echoing Ruins':
      return gainArtifact(hero, quest.quest.id);

    case 'The Whispering Grove':
      return treasureType <= 0.3 ? gainItem(player, hero) : gainArtifact(hero, quest.quest.id);

    case 'The Abyssal Crypt':
      if (treasureType <= 0.2) {
        return gainRelic(gameState, hero);
      } else if (treasureType <= 0.55) {
        return gainItem(player, hero);
      } else {
        return gainArtifact(hero, quest.quest.id);
      }
    case 'The Shattered Sky':
      return treasureType <= 0.4 ? gainRelic(gameState, hero) : gainItem(player, hero);
  }
};

const gainArtifact = (hero: HeroUnit, questType: QuestType): HeroOutcome => {
  const baseArtifactLevel = getQuest(questType).level;
  const heroArtifact: Artifact = {
    ...getRandomElement(artifacts),
    level: getRandomElement([baseArtifactLevel, baseArtifactLevel + 1, baseArtifactLevel + 2]),
  };
  // todo if hero already has artifact, then allow user to choose between two artifacts
  hero.artifacts.push(heroArtifact);

  return {
    status: HeroOutcomeType.Minor,
    message: heroGainArtifact(hero.name, heroArtifact),
  };
};

const gainItem = (player: PlayerState, hero: HeroUnit): HeroOutcome => {
  const item = getRandomElement(items);
  if (item.charge == null) {
    item.charge = getRandomElement([7, 10, 15]);
  }
  player.empireTreasures.push(item);

  return {
    status: HeroOutcomeType.Positive,
    message: heroGainItem(hero.name, item),
  };
};

const gainRelic = (gameState: GameState, hero: HeroUnit): HeroOutcome => {
  const relicInPlay = gameState.allPlayers.flatMap((p) => p.empireTreasures);
  const turnOwner = gameState.turnOwner;
  const availableRelics = relicts
    .filter((a) => a.alignment == null || a.alignment === turnOwner.getAlignment())
    .filter((a) => !relicInPlay.some((r) => r.id === a.id));

  if (availableRelics.length > 0) {
    const relic = getRandomElement(availableRelics);
    turnOwner.empireTreasures.push(relic);

    return {
      status: HeroOutcomeType.Legendary,
      message: heroGainRelic(hero.name, relic),
    };
  } else {
    return gainItem(turnOwner, hero);
  }
};

const questResults = (quest: HeroQuest, gameState: GameState): HeroOutcome => {
  let questOutcome: HeroOutcome;
  const turnOwner = gameState.turnOwner;

  if (
    // player survived quest
    surviveInQuest(quest) &&
    // and player still controls the land where quest is
    gameState.getLandOwner(quest.land) === turnOwner.id
  ) {
    const hero = quest.hero;

    if (hero.level < quest.quest.level * 5) {
      hero.levelUp(turnOwner.getAlignment());
      //levelUpHero(hero, turnOwner);
    }

    questOutcome = calculateReward(hero, quest, gameState);

    // return hero to quest land (with artifact if the hero gain it) that is why it is after calculateReward
    const stationedArmy = gameState.getLand(quest.land).army.find((a) => a.movements == null);
    if (stationedArmy) {
      // add into the existing stationed Army
      stationedArmy.units.push(hero);
    } else {
      // no valid army found, create new one
      gameState.getLand(quest.land).army.push({
        units: [hero],
        controlledBy: turnOwner.id,
      });
    }
  } else {
    questOutcome = {
      status: HeroOutcomeType.Negative,
      message: heroDieMessage(quest.hero.name),
    };
  }

  return questOutcome;
};

export const completeQuest = (gameState: GameState): HeroOutcome[] => {
  const turnOwner = gameState.turnOwner;
  // decrease turnsByQuest counter
  turnOwner.quests.forEach((quest) => {
    quest.remainTurnsInQuest--;
  });

  // complete quests
  const status = turnOwner.quests
    .filter((quest) => quest.remainTurnsInQuest === 0)
    .map((q) => questResults(q, gameState));

  // remove completed quests from quests array
  turnOwner.quests = turnOwner.quests.filter((quest) => quest.remainTurnsInQuest > 0);

  return status;
};
