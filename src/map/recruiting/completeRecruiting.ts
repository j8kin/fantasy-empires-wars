import { GameState } from '../../state/GameState';
import { getLands } from '../utils/getLands';
import { BuildingType } from '../../types/Building';
import { isHeroType } from '../../types/UnitType';
import { createRegularUnit, RegularUnit } from '../../types/RegularUnit';
import { HeroOutcome, HeroOutcomeType } from '../../types/HeroOutcome';
import { createHeroUnit, HeroUnit } from '../../types/HeroUnit';
import { generateHeroName } from './heroNameGeneration';
import { heroRecruitingMessage } from './heroRecruitingMessage';

export const completeRecruiting = (gameState: GameState): HeroOutcome[] => {
  const heroesRecruited: HeroOutcome[] = [];
  const turnOwner = gameState.turnOwner.id;

  getLands({
    gameState: gameState,
    players: [turnOwner],
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
            const unit = isHeroType(s.unit)
              ? createHeroUnit(s.unit, generateHeroName(s.unit))
              : createRegularUnit(s.unit);
            if (isHeroType(unit.id)) {
              // generate uniq name for hero
              heroesRecruited.push({
                status: HeroOutcomeType.Success,
                message: heroRecruitingMessage(unit as HeroUnit),
              });
            }
            const stationedArmy = l.army.find(
              (a) => a.movements == null && a.controlledBy === turnOwner
            );
            if (stationedArmy) {
              if (!isHeroType(unit.id)) {
                const existing = stationedArmy.units.find(
                  (u) => u.id === unit.id && u.level === unit.level
                );
                if (existing) {
                  (existing as RegularUnit).count += (unit as RegularUnit).count;
                } else {
                  stationedArmy.units.push(unit);
                }
              } else {
                stationedArmy.units.push(unit);
              }
            } else {
              l.army.push({ units: [unit], controlledBy: turnOwner });
            }
          }
        });
        b.slots = b.slots.filter((s) => s.turnsRemaining > 0);
      }
    })
  );

  return heroesRecruited;
};
