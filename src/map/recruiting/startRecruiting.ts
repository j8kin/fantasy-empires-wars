import { getLand, getLandOwner, hasActiveEffect } from '../../selectors/landSelectors';
import { getTurnOwner, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import { hasAvailableSlot } from '../../selectors/buildingSelectors';
import { startRecruitmentInSlot, updatePlayerVault } from '../../systems/gameStateActions';
import { isHeroType, isMageType } from '../../domain/unit/unitTypeChecks';
import { getRecruitDuration } from '../../domain/unit/recruitmentRules';
import { unitsBaseStats } from '../../domain/unit/unitRepository';

import { BuildingType } from '../../types/Building';
import { TreasureType } from '../../types/Treasures';
import { HeroUnitType } from '../../types/UnitType';
import { SpellName } from '../../types/Spell';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { UnitType } from '../../types/UnitType';

export const startRecruiting = (
  state: GameState,
  landPos: LandPosition,
  unitType: UnitType
): void => {
  if (getLandOwner(state, landPos) !== state.turnOwner) {
    return; // fallback: a wrong Land Owner should never happen on real game
  }
  const land = getLand(state, landPos);
  const buildingIdx = land.buildings.findIndex((b) => hasAvailableSlot(b));
  if (buildingIdx !== -1) {
    // additionally verify that regular units and non-magic heroes are recruited in BARRACKS and mages are in mage tower
    if (isHeroType(unitType)) {
      if (!isMageType(unitType)) {
        if (land.buildings[buildingIdx].id !== BuildingType.BARRACKS) {
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
        if (expectedMageTower == null || land.buildings[buildingIdx].id !== expectedMageTower) {
          return;
        }
      }
    } else if (land.buildings[buildingIdx].id !== BuildingType.BARRACKS) {
      return; // fallback: wrong building type for regular units
    }

    const turnOwner = getTurnOwner(state);
    const availableGold = turnOwner.vault;
    if (availableGold != null && availableGold >= unitsBaseStats(unitType).recruitCost) {
      let newState: GameState = state;
      const hasCrownOfDominion = hasTreasureByPlayer(turnOwner, TreasureType.CROWN_OF_DOMINION);

      const costReduction = hasCrownOfDominion
        ? Math.ceil(unitsBaseStats(unitType).recruitCost * 0.85)
        : unitsBaseStats(unitType).recruitCost;

      // Ember raid increases recruitment duration by 1 turn
      const hasEmberRaidEffect = hasActiveEffect(land, SpellName.EMBER_RAID);

      newState = updatePlayerVault(newState, turnOwner.id, -costReduction);

      // Start recruitment in first available slot
      newState = startRecruitmentInSlot(
        newState,
        landPos,
        buildingIdx,
        unitType,
        getRecruitDuration(unitType) + (hasEmberRaidEffect ? 1 : 0) + (land.corrupted ? 1 : 0) // corrupted lands add one additional turn to recruitment
      );

      // Update state
      Object.assign(state, newState);
    }
  }
};
