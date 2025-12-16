import { GameState } from '../../state/GameState';
import { HeroState } from '../../state/army/HeroState';

import { armyFactory } from '../../factories/armyFactory';
import { getLandOwner } from '../../selectors/landSelectors';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition, isMoving } from '../../selectors/armySelectors';
import { addArmyToGameState, addHero, updateArmyInGameState } from '../../systems/armyActions';
import { levelUpHero } from '../../systems/unitsActions';
import {
  addPlayerEmpireTreasure,
  decrementQuestTurns,
  removeCompletedQuests,
} from '../../systems/gameStateActions';
import {
  artifactFactory,
  getRelicAlignment,
  itemFactory,
  relictFactory,
} from '../../factories/treasureFactory';

import { artifacts, items, relicts } from '../../domain/treasure/treasureRepository';
import { getQuest } from '../../domain/quest/questRepository';
import { getRandomElement } from '../../domain/utils/random';

import { HeroQuest, QuestType } from '../../types/Quest';
import { HeroOutcome, HeroOutcomeType } from '../../types/HeroOutcome';
import { Artifact } from '../../types/Treasures';
import {
  emptyHanded,
  heroDieMessage,
  heroGainArtifact,
  heroGainItem,
  heroGainRelic,
} from './questCompleteMessages';
import { Alignment } from '../../types/Alignment';

const surviveInQuest = (quest: HeroQuest): boolean => {
  return Math.random() <= 0.8 + (quest.hero.level - 1 - (quest.quest.level - 1) * 5) * 0.05;
};

const calculateReward = (
  hero: HeroState,
  quest: HeroQuest,
  gameState: GameState
): { outcome: HeroOutcome; updatedHero: HeroState } => {
  if (Math.random() > 0.55 - 0.05 * (quest.quest.level - 1)) {
    return {
      outcome: {
        status: HeroOutcomeType.Neutral,
        message: emptyHanded(quest.hero.name),
      },
      updatedHero: hero, // No changes to hero
    };
  }
  const treasureType = Math.random();

  switch (quest.quest.id) {
    case 'The Echoing Ruins':
      return gainArtifact(hero, quest.quest.id);

    case 'The Whispering Grove':
      if (treasureType <= 0.3) {
        return { outcome: gainItem(gameState, hero), updatedHero: hero };
      } else {
        return gainArtifact(hero, quest.quest.id);
      }

    case 'The Abyssal Crypt':
      if (treasureType <= 0.2) {
        return { outcome: gainRelic(gameState, hero), updatedHero: hero };
      } else if (treasureType <= 0.55) {
        return { outcome: gainItem(gameState, hero), updatedHero: hero };
      } else {
        return gainArtifact(hero, quest.quest.id);
      }
    case 'The Shattered Sky':
      if (treasureType <= 0.4) {
        return { outcome: gainRelic(gameState, hero), updatedHero: hero };
      } else {
        return { outcome: gainItem(gameState, hero), updatedHero: hero };
      }
  }
};

const gainArtifact = (
  hero: HeroState,
  questType: QuestType
): { outcome: HeroOutcome; updatedHero: HeroState } => {
  const baseArtifactLevel = getQuest(questType).level;
  const heroArtifact: Artifact = artifactFactory(
    getRandomElement(artifacts).type,
    getRandomElement([baseArtifactLevel, baseArtifactLevel + 1, baseArtifactLevel + 2])
  );
  // todo if hero already has artifact, then allow user to choose between two artifacts

  const updatedHero = {
    ...hero,
    artifacts: [...hero.artifacts, heroArtifact],
  };

  return {
    outcome: {
      status: HeroOutcomeType.Minor,
      message: heroGainArtifact(hero.name, heroArtifact),
    },
    updatedHero,
  };
};

const gainItem = (gameState: GameState, hero: HeroState): HeroOutcome => {
  const turnOwner = getTurnOwner(gameState);
  const itemType = getRandomElement(items).type;

  Object.assign(gameState, addPlayerEmpireTreasure(gameState, turnOwner.id, itemFactory(itemType)));

  return {
    status: HeroOutcomeType.Positive,
    message: heroGainItem(hero.name, itemType),
  };
};

const gainRelic = (gameState: GameState, hero: HeroState): HeroOutcome => {
  const relicInPlay = gameState.players.flatMap((p) => p.empireTreasures);
  const turnOwner = getTurnOwner(gameState);
  const availableRelics = relicts
    .filter(
      (a) =>
        getRelicAlignment(a.type) === Alignment.NONE ||
        getRelicAlignment(a.type) === turnOwner.playerProfile.alignment
    )
    .filter((a) => !relicInPlay.some((r) => r.treasure.type === a.type));

  if (availableRelics.length > 0) {
    const relicType = getRandomElement(availableRelics).type;
    Object.assign(
      gameState,
      addPlayerEmpireTreasure(gameState, turnOwner.id, relictFactory(relicType))
    );

    return {
      status: HeroOutcomeType.Legendary,
      message: heroGainRelic(hero.name, relicType),
    };
  } else {
    return gainItem(gameState, hero);
  }
};

const questResults = (quest: HeroQuest, gameState: GameState): HeroOutcome => {
  let questOutcome: HeroOutcome;
  const turnOwner = getTurnOwner(gameState);

  if (
    // player survived quest
    surviveInQuest(quest) &&
    // and player still controls the land where quest is
    getLandOwner(gameState, quest.land) === turnOwner.id
  ) {
    let hero = quest.hero;

    if (hero.level < quest.quest.level * 5) {
      levelUpHero(hero, turnOwner.playerProfile.alignment);
      //levelUpHero(hero, turnOwner);
    }

    const rewardResult = calculateReward(hero, quest, gameState);
    questOutcome = rewardResult.outcome;
    hero = rewardResult.updatedHero; // Use potentially updated hero with artifacts

    // return hero to quest land (with artifact if the hero gain it) that is why it is after calculateReward
    const armiesAtPosition = getArmiesAtPosition(gameState, quest.land);
    const stationedArmy = armiesAtPosition.find(
      (a) => !isMoving(a) && a.controlledBy === turnOwner.id
    );
    if (stationedArmy) {
      // add into the existing stationed Army
      const updatedArmy = addHero(stationedArmy, hero);
      Object.assign(stationedArmy, updatedArmy);
      Object.assign(gameState, updateArmyInGameState(gameState, stationedArmy));
    } else {
      // no valid army found, create new one
      const newArmy = armyFactory(turnOwner.id, quest.land, [hero]);
      Object.assign(gameState, addArmyToGameState(gameState, newArmy));
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
  const turnOwner = getTurnOwner(gameState);

  // First, decrement quest turn counters immutably
  Object.assign(gameState, decrementQuestTurns(gameState, turnOwner.id));

  // Get quests that are ready to complete (after decrementing)
  const updatedTurnOwner = getTurnOwner(gameState); // Get fresh reference after state update
  const questsToComplete = updatedTurnOwner.quests.filter(
    (quest) => quest.remainTurnsInQuest === 0
  );

  // Complete quests and collect outcomes
  const status = questsToComplete.map((q) => questResults(q, gameState));

  // Remove completed quests from quests array immutably
  Object.assign(gameState, removeCompletedQuests(gameState, turnOwner.id));

  return status;
};
