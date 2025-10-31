import {
  getDefaultUnit,
  HeroUnit,
  HeroUnitType,
  isHeroType,
  RegularUnitType,
  UnitType,
} from '../../types/Army';
import { getLand, LandPosition } from '../utils/getLands';
import { GameState, getTurnOwner, TurnPhase } from '../../types/GameState';
import { BuildingType } from '../../types/Building';

const recruitmentDuration = (unitType: UnitType) => {
  switch (unitType) {
    case RegularUnitType.WARRIOR:
    case RegularUnitType.DWARF:
    case RegularUnitType.ORC:
      return 1;
    case RegularUnitType.ELF:
    case RegularUnitType.DARK_ELF:
      return 2;
    case RegularUnitType.BALLISTA:
    case RegularUnitType.CATAPULT:
      return 3;
    default:
      // all heroes are recruited in 3 turns
      return 3;
  }
};

export const startRecruiting = (
  unitType: UnitType,
  landPos: LandPosition,
  gameState: GameState
): void => {
  if (
    getLand(gameState, landPos).controlledBy !== gameState.turnOwner &&
    gameState.turnPhase !== TurnPhase.MAIN
  ) {
    return; // fallback: a wrong Land Owner should never happen on real game
  }
  // recruitment available only in MAIN phase if there is a slot available
  const building = getLand(gameState, landPos).buildings.filter(
    (b) => b.slots != null && b.slots.length < b.numberOfSlots
  );
  if (building.length === 1) {
    // additionally verify that regular units and non-magic heroes are recruited in BARRACKS and mages are in mage tower
    if (isHeroType(unitType)) {
      if ((getDefaultUnit(unitType) as HeroUnit).mana == null) {
        if (building[0].id !== BuildingType.BARRACKS) {
          return; // fallback: wrong building type for non-magic heroes
        }
      } else {
        // fallback: wrong building type for mages
        let expectedMageTower: BuildingType | undefined = undefined;
        switch (unitType) {
          case HeroUnitType.CLERIC:
            expectedMageTower = BuildingType.WHITE_MAGE_TOWER;
            break;
          case HeroUnitType.DRUID:
            expectedMageTower = BuildingType.GREEN_MAGE_TOWER;
            break;
          case HeroUnitType.ENCHANTER:
            expectedMageTower = BuildingType.BLUE_MAGE_TOWER;
            break;
          case HeroUnitType.PYROMANCER:
            expectedMageTower = BuildingType.RED_MAGE_TOWER;
            break;
          case HeroUnitType.NECROMANCER:
            expectedMageTower = BuildingType.BLACK_MAGE_TOWER;
            break;
          default:
            break; // fallback should never reach here
        }
        if (expectedMageTower == null || building[0].id !== expectedMageTower) {
          return;
        }
      }
    } else if (building[0].id !== BuildingType.BARRACKS) {
      return; // fallback: wrong building type for regular units
    }

    const availableGold = getTurnOwner(gameState)!.money;
    if (availableGold != null && availableGold > getDefaultUnit(unitType)!.recruitCost) {
      getTurnOwner(gameState)!.money -= getDefaultUnit(unitType).recruitCost;
      building[0].slots!.push({
        unit: unitType,
        turnsRemaining: recruitmentDuration(unitType),
      });
    }
  }
};
