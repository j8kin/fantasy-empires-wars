import { GameState } from '../../state/GameState';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getHero } from '../../systems/armyActions';

import { getQuest, QuestType } from '../../types/Quest';
import { HeroState } from '../../state/army/HeroState';

import { getLands } from '../utils/getLands';

export const startQuest = (hero: HeroState, questType: QuestType, gameState: GameState) => {
  const turnOwner = getTurnOwner(gameState);

  const heroLand = getLands({
    gameState: gameState,
    players: [turnOwner.id],
    noArmy: false,
  }).find((land) => land.army.find((army) => army.heroes.some((unit) => unit.name === hero.name)));

  if (heroLand != null) {
    // remove hero from the battlefield
    const heroToQuest = getHero(
      heroLand.army.find((army) => army.heroes.some((unit) => unit.name === hero.name))!,
      hero.name
    )!;

    // Remove armies with no units
    heroLand.army = heroLand.army.filter(
      (army) => army.regulars.length > 0 || army.heroes.length > 0
    );

    // send hero to quest
    turnOwner.quests.push({
      quest: getQuest(questType),
      land: heroLand.mapPos, // hero Start Quest land position (it will return at the same position if survive)
      hero: heroToQuest,
      remainTurnsInQuest: getQuest(questType).length,
    });
  }
};
