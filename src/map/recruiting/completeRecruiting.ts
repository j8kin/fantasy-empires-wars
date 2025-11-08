import { GameState, getTurnOwner } from '../../types/GameState';
import { getLands } from '../utils/getLands';
import { BuildingType } from '../../types/Building';
import { getDefaultUnit, HeroUnit, HeroUnitType, isHero } from '../../types/Army';
import { generateHeroName } from './heroNameGeneration';

export const completeRecruiting = (gameState: GameState): string [] => {
  const heroesRecruited: string[] = [];
  getLands({
    lands: gameState.battlefield.lands,
    players: [getTurnOwner(gameState)!],
    buildings: [
      BuildingType.BARRACKS,
      BuildingType.WHITE_MAGE_TOWER,
      BuildingType.BLACK_MAGE_TOWER,
      BuildingType.GREEN_MAGE_TOWER,
      BuildingType.BLUE_MAGE_TOWER,
      BuildingType.RED_MAGE_TOWER,
    ],
  }).forEach((l) =>
    l.buildings.forEach((b) => {
      if (b.slots) {
        b.slots.forEach((s) => {
          s.turnsRemaining--;
          if (s.turnsRemaining === 0) {
            const unit = getDefaultUnit(s.unit);
            if (isHero(unit)) {
              // generate uniq name for hero
              (unit as HeroUnit).name = generateHeroName(unit.id as HeroUnitType);
            }
            l.army.push({ unit: unit, isMoving: false });
          }
        });
        b.slots = b.slots.filter((s) => s.turnsRemaining > 0);
      }
    })
  );

  return heroesRecruited;
};
