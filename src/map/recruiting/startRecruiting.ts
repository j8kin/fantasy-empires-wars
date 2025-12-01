import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { isHeroType, isMageType } from '../../domain/unit/unitTypeChecks';
import { getRecruitDuration } from '../../domain/unit/recruitmentRules';
import { unitsBaseStats } from '../../domain/unit/unitRepository';

import { BuildingType } from '../../types/Building';
import { TreasureItem } from '../../types/Treasures';
import { HeroUnitType, UnitType } from '../../types/UnitType';

export const startRecruiting = (
  unitType: UnitType,
  landPos: LandPosition,
  gameState: GameState
): void => {
  if (getLandOwner(gameState, landPos) !== gameState.turnOwner) {
    return; // fallback: a wrong Land Owner should never happen on real game
  }
  // recruitment available only in MAIN phase if there is a slot available
  const building = getLand(gameState, landPos).buildings.filter(
    (b) => b.slots != null && b.slots.length < b.numberOfSlots
  );
  if (building.length === 1) {
    // additionally verify that regular units and non-magic heroes are recruited in BARRACKS and mages are in mage tower
    if (isHeroType(unitType)) {
      if (!isMageType(unitType)) {
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

    const turnOwner = getTurnOwner(gameState);
    const availableGold = turnOwner.vault;
    if (availableGold != null && availableGold >= unitsBaseStats(unitType).recruitCost) {
      const hasCrownOfDominion = turnOwner.empireTreasures?.some(
        (r) => r.id === TreasureItem.CROWN_OF_DOMINION
      );
      turnOwner.vault -= hasCrownOfDominion
        ? Math.ceil(unitsBaseStats(unitType).recruitCost * 0.85)
        : unitsBaseStats(unitType).recruitCost;
      building[0].slots!.push({
        unit: unitType,
        turnsRemaining: getRecruitDuration(unitType),
      });
    }
  }
};
