import { armyFactory } from '../../factories/armyFactory';
import { getLandOwner } from '../../selectors/landSelectors';
import {
  getTreasureItem,
  getTurnOwner,
  hasTreasureByPlayer,
} from '../../selectors/playerSelectors';
import { getArmiesAtPosition, isMoving } from '../../selectors/armySelectors';
import { addArmyToGameState, addHero, updateArmyInGameState } from '../../systems/armyActions';
import { levelUpHero } from '../../systems/unitsActions';
import { removeEmpireTreasureItem } from '../../systems/playerActions';
import {
  addPlayerEmpireTreasure,
  decrementQuestTurns,
  removeCompletedQuests,
  updatePlayer,
} from '../../systems/gameStateActions';
import {
  artifactFactory,
  getRelicAlignment,
  itemFactory,
  relictFactory,
} from '../../factories/treasureFactory';
import { artifacts, items, relicts } from '../../domain/treasure/treasureRepository';
import { getQuest } from '../../domain/quest/questRepository';
import { getRandomElement, getRandomInt } from '../../domain/utils/random';
import {
  emptyHanded,
  heroDieMessage,
  heroGainArtifact,
  heroGainItem,
  heroGainRelic,
} from './questCompleteMessages';

import type { EmpireEvent } from '../../types/EmpireEvent';
import { EmpireEventKind } from '../../types/EmpireEvent';
import type { Artifact } from '../../types/Treasures';
import { TreasureName } from '../../types/Treasures';
import { Alignment } from '../../types/Alignment';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { HeroQuest, QuestType } from '../../types/Quest';
import type { HeroState } from '../../state/army/HeroState';

const surviveInQuest = (quest: HeroQuest): boolean => {
  return Math.random() <= 0.8 + (quest.hero.level - 1 - (quest.quest.level - 1) * 5) * 0.05;
};

const calculateReward = (
  state: GameState,
  quest: HeroQuest
): { outcome: EmpireEvent; updatedHero: HeroState } => {
  if (Math.random() > 0.55 - 0.05 * (quest.quest.level - 1)) {
    return {
      outcome: {
        status: EmpireEventKind.Neutral,
        message: emptyHanded(quest.hero.name),
      },
      updatedHero: quest.hero, // No changes to hero
    };
  }
  const treasureType = Math.random();

  switch (quest.quest.id) {
    case 'The Echoing Ruins':
      return gainArtifact(quest.hero, quest.quest.id);

    case 'The Whispering Grove':
      if (treasureType <= 0.3) {
        return { outcome: gainItem(state, quest.hero), updatedHero: quest.hero };
      } else {
        return gainArtifact(quest.hero, quest.quest.id);
      }

    case 'The Abyssal Crypt':
      if (treasureType <= 0.2) {
        return { outcome: gainRelic(state, quest.hero), updatedHero: quest.hero };
      } else if (treasureType <= 0.55) {
        return { outcome: gainItem(state, quest.hero), updatedHero: quest.hero };
      } else {
        return gainArtifact(quest.hero, quest.quest.id);
      }
    case 'The Shattered Sky':
      if (treasureType <= 0.4) {
        return { outcome: gainRelic(state, quest.hero), updatedHero: quest.hero };
      } else {
        return { outcome: gainItem(state, quest.hero), updatedHero: quest.hero };
      }
  }
};

const gainArtifact = (
  hero: HeroState,
  questType: QuestType
): { outcome: EmpireEvent; updatedHero: HeroState } => {
  const artifact = getRandomElement(artifacts);
  const baseArtifactLevel = getQuest(questType).level;
  const heroArtifact: Artifact = artifactFactory(
    artifact.type,
    artifact.isConsumable ? getRandomInt(baseArtifactLevel, baseArtifactLevel + 2) : 0
  );
  // todo if hero already has artifact, then allow user to choose between two artifacts

  const updatedHero = {
    ...hero,
    artifacts: [...hero.artifacts, heroArtifact],
  };

  return {
    outcome: {
      status: EmpireEventKind.Minor,
      message: heroGainArtifact(hero.name, heroArtifact),
    },
    updatedHero,
  };
};

const gainItem = (state: GameState, hero: HeroState): EmpireEvent => {
  const turnOwner = getTurnOwner(state);
  const itemType = getRandomElement(items).type;

  Object.assign(state, addPlayerEmpireTreasure(state, turnOwner.id, itemFactory(itemType)));

  return {
    status: EmpireEventKind.Positive,
    message: heroGainItem(hero.name, itemType),
  };
};

const gainRelic = (state: GameState, hero: HeroState): EmpireEvent => {
  const relicInPlay = state.players.flatMap((p) => p.empireTreasures);
  const turnOwner = getTurnOwner(state);
  const availableRelics = relicts
    .filter(
      (a) =>
        getRelicAlignment(a.type) === Alignment.NONE ||
        getRelicAlignment(a.type) === turnOwner.playerProfile.alignment
    )
    .filter((a) => !relicInPlay.some((r) => r.treasure.type === a.type));

  if (availableRelics.length > 0) {
    const relicType = getRandomElement(availableRelics).type;
    Object.assign(state, addPlayerEmpireTreasure(state, turnOwner.id, relictFactory(relicType)));

    return {
      status: EmpireEventKind.Legendary,
      message: heroGainRelic(hero.name, relicType),
    };
  } else {
    return gainItem(state, hero);
  }
};

const questResults = (state: GameState, quest: HeroQuest): EmpireEvent => {
  let questOutcome: EmpireEvent;
  const turnOwner = getTurnOwner(state);

  if (
    // player survived quest
    surviveInQuest(quest) &&
    // and player still controls the land where quest is
    getLandOwner(state, quest.land) === turnOwner.id
  ) {
    const rewardResult = calculateReward(state, quest);
    questOutcome = rewardResult.outcome;
    const hero: HeroState = { ...rewardResult.updatedHero }; // Use potentially updated hero with artifacts

    if (hero.level < quest.quest.level * 5) {
      do {
        levelUpHero(hero, turnOwner.playerProfile.alignment);
      } while (hero.level < (quest.quest.level - 1) * 5); // promote to lower quest level for risky players!
    }

    returnHeroOnMap(state, hero, quest.land);
  } else {
    if (hasTreasureByPlayer(turnOwner, TreasureName.MERCY_OF_ORRIVANE) && quest.hero.level >= 10) {
      // No time to die, Orrivane gives a mercy but not a new level
      questOutcome = {
        status: EmpireEventKind.Success,
        message: `${heroDieMessage(quest.hero.name)} Yet Orrivane remembered them, and the world bent so they might return.`,
      };
      returnHeroOnMap(state, quest.hero, quest.land);

      Object.assign(
        state,
        updatePlayer(
          state,
          turnOwner.id,
          removeEmpireTreasureItem(
            turnOwner,
            // get first Mercy of Orrivane item and destroy it
            getTreasureItem(turnOwner, TreasureName.MERCY_OF_ORRIVANE)!
          )
        )
      );
    } else {
      questOutcome = {
        status: EmpireEventKind.Negative,
        message: heroDieMessage(quest.hero.name),
      };
    }
  }

  return questOutcome;
};

const returnHeroOnMap = (state: GameState, hero: HeroState, landPosition: LandPosition) => {
  const armiesAtPosition = getArmiesAtPosition(state, landPosition);
  const stationedArmy = armiesAtPosition.find(
    (a) => !isMoving(a) && a.controlledBy === state.turnOwner
  );
  if (stationedArmy) {
    // add into the existing stationed Army
    const updatedArmy = addHero(stationedArmy, hero);
    Object.assign(stationedArmy, updatedArmy);
    Object.assign(state, updateArmyInGameState(state, stationedArmy));
  } else {
    // no valid army found, create new one
    const newArmy = armyFactory(state.turnOwner, landPosition, [hero]);
    Object.assign(state, addArmyToGameState(state, newArmy));
  }
};

export const completeQuest = (state: GameState): EmpireEvent[] => {
  const turnOwner = getTurnOwner(state);

  // First, decrement quest turn counters immutably
  Object.assign(state, decrementQuestTurns(state, turnOwner.id));

  // Get quests that are ready to complete (after decrementing)
  const updatedTurnOwner = getTurnOwner(state); // Get fresh reference after state update
  const questsToComplete = updatedTurnOwner.quests.filter(
    (quest) => quest.remainTurnsInQuest === 0
  );

  // Complete quests and collect outcomes
  const status = questsToComplete.map((q) => questResults(state, q));

  // Remove completed quests from quests array immutably
  Object.assign(state, removeCompletedQuests(state, turnOwner.id));

  return status;
};
