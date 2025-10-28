import { HeroUnit, HeroUnitType, isHero, Unit } from '../../types/Army';
import { battlefieldLandId, GameState, getTurnOwner, TurnPhase } from '../../types/GameState';
import { BuildingType } from '../../types/Building';
import { LandPosition } from '../utils/getLands';

/**
 * Place units on Map should be called only when recruit count is 0 for related slot in Building
 * This function must be call on START Phase of the turn
 * The only one exception is Turn 1 when heroes are placed on Homeland
 */
export const placeUnitsOnMap = (unit: Unit, gameState: GameState, landPos: LandPosition): void => {
  if (gameState.turn === 1 && gameState.turnPhase === TurnPhase.START) {
    // on turn 1 heroes are placed on Homeland only
    const heroUnit = unit as HeroUnit;
    if (
      heroUnit &&
      heroUnit.name === getTurnOwner(gameState)?.name &&
      gameState.battlefield.lands[battlefieldLandId(landPos)].buildings.some(
        (b) => b.id === BuildingType.STRONGHOLD
      )
    ) {
      gameState.battlefield.lands[battlefieldLandId(landPos)].army.push({
        unit: unit,
        isMoving: false,
      });
    }
  } else {
    const land = gameState.battlefield.lands[battlefieldLandId(landPos)];
    if (!isHero(unit)) {
      // regular units could be placed only on land with BARRACKS
      if (land.buildings.some((b) => b.id === BuildingType.BARRACKS)) {
        land.army.push({ unit: unit, isMoving: false });
      }
    } else {
      const heroUnit = unit as HeroUnit;
      if (heroUnit.mana == null) {
        // non-magic Heroes could be placed only on land with BARRACKS
        if (land.buildings.some((b) => b.id === BuildingType.BARRACKS)) {
          land.army.push({ unit: heroUnit, isMoving: false });
        }
      } else {
        // mages could be placed only on land with MAGE TOWER
        let expectedMageTower: BuildingType;
        switch (heroUnit.id) {
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
        if (land.buildings.some((b) => b.id === expectedMageTower)) {
          land.army.push({ unit: unit, isMoving: false });
        }
      }
    }
  }
};
