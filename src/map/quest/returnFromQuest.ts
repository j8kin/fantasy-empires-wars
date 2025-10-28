import { battlefieldLandId, GameState, getTurnOwner, TurnPhase } from '../../types/GameState';
import { HeroQuest, questLevel } from './Quest';

const heroDieMessage = (name: string): string => {
  const messageId = Math.floor(Math.random() * 8);
  switch (messageId) {
    case 0:
      return `Hero ${name} ventured beyond the known paths of Orrivane and did not return.`;
    case 1:
      return `Hero ${name} was lost to the mists of fate — their story ends where legends begin.`;
    case 2:
      return `Hero ${name} vanished upon the quest, their fate whispered only by the winds.`;
    case 3:
      return `Hero ${name} did not return from the quest; Orrivane itself has claimed their spirit.`;
    case 4:
      return `Hero ${name} walked into the unknown and became one with the tales of old.`;
    case 5:
      return `Hero ${name} has not returned. Some say the land remembers their name in silence.`;
    case 6:
      return `Hero ${name} was swallowed by destiny’s shadow — only echoes remain.`;
    default:
      return `Hero ${name} set forth seeking glory, but the realm offered only silence in return.`;
  }
};

const surviveInQuest = (quest: HeroQuest): boolean => {
  return Math.random() <= 0.8 + (quest.hero.level - 1 - (questLevel(quest.id) - 1) * 5) * 0.05;
};

const questComplete = (quest: HeroQuest, gameState: GameState): string => {
  // check that hero is still alive
  const survived = surviveInQuest(quest);
  if (survived) {
    // if player does not control land, then hero DIES
    if (
      gameState.battlefield.lands[battlefieldLandId(quest.land)].controlledBy ===
      gameState.turnOwner
    ) {
      const hero = quest.hero;
      if (hero.level < questLevel(quest.id) * 5) {
        hero.level++;
      }

      // todo GAIN REWARD for completing quest

      // return hero to quest land
      gameState.battlefield.lands[battlefieldLandId(quest.land)].army.push({
        unit: hero,
        isMoving: false,
      });
      return `Hero ${quest.hero.name} returned with the glory of ${quest.id}.`;
    } else {
      return heroDieMessage(quest.hero.name);
    }
  } else {
    return heroDieMessage(quest.hero.name);
  }
};

export const returnFromQuest = (gameState: GameState): string[] => {
  if (gameState.turnPhase !== TurnPhase.START) return [];

  // decrease turnsByQuest counter
  getTurnOwner(gameState)?.quests.forEach((quest) => {
    quest.remainTurnsInQuest--;
  });

  // complete quests
  const status = getTurnOwner(gameState)!
    .quests.filter((quest) => quest.remainTurnsInQuest === 0)
    .map((q) => questComplete(q, gameState));

  // remove completed quests from quests array
  getTurnOwner(gameState)!.quests = getTurnOwner(gameState)!.quests.filter(
    (quest) => quest.remainTurnsInQuest > 0
  );

  return status;
};
