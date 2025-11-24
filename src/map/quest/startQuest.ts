import { GameState } from '../../state/GameState';
import { getQuest, QuestType } from '../../types/Quest';
import { HeroUnit } from '../../types/HeroUnit';
import { isHeroType } from '../../types/UnitType';
import { getLands } from '../utils/getLands';

export const startQuest = (hero: HeroUnit, questType: QuestType, gameState: GameState) => {
  const turnOwner = gameState.turnOwner;

  const heroLand = getLands({
    gameState: gameState,
    players: [turnOwner.id],
    noArmy: false,
  }).find((land) =>
    land.army.find((army) =>
      army.units.some((unit) => isHeroType(unit.id) && (unit as HeroUnit).name === hero.name)
    )
  );

  if (heroLand != null) {
    // remove hero from the battlefield
    heroLand.army = [...heroLand.army]
      .map((army) => ({
        ...army,
        units: army.units.filter(
          (unit) => !(isHeroType(unit.id) && (unit as HeroUnit).name === hero.name)
        ),
      }))
      .filter((army) => army.units.length > 0);

    // send hero to quest
    turnOwner.quests.push({
      quest: getQuest(questType),
      land: heroLand.mapPos, // hero Start Quest land position (it will return at the same position if survive)
      hero: hero,
      remainTurnsInQuest: getQuest(questType).length,
    });
  }
};
