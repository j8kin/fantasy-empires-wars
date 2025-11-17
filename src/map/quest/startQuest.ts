import { GameState, getTurnOwner, TurnPhase } from '../../types/GameState';
import { HeroUnit, isHero } from '../../types/Army';
import { getQuest, QuestType } from '../../types/Quest';
import { getLands } from '../utils/getLands';

export const startQuest = (hero: HeroUnit, questType: QuestType, gameState: GameState) => {
  if (gameState.turnPhase !== TurnPhase.MAIN) return;

  const heroLand = getLands({
    gameState: gameState,
    players: [gameState.turnOwner],
    noArmy: false,
  }).find((land) =>
    land.army.find((army) =>
      army.units.some((unit) => isHero(unit) && (unit as HeroUnit).name === hero.name)
    )
  );

  if (heroLand != null) {
    // remove hero from the battlefield
    heroLand.army = [...heroLand.army]
      .map((army) => ({
        ...army,
        units: army.units.filter(
          (unit) => !(isHero(unit) && (unit as HeroUnit).name === hero.name)
        ),
      }))
      .filter((army) => army.units.length > 0);

    // send hero to quest
    getTurnOwner(gameState)?.quests.push({
      quest: getQuest(questType),
      land: heroLand.mapPos, // hero Start Quest land position (it will return at the same position if survive)
      hero: hero,
      remainTurnsInQuest: getQuest(questType).length,
    });
  }
};
