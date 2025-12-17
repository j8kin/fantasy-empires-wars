import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';

import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { getTurnOwner, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import { updatePlayerVault } from '../../systems/gameStateActions';
import { isHeroType, isMageType } from '../../domain/unit/unitTypeChecks';
import { getRecruitDuration } from '../../domain/unit/recruitmentRules';
import { unitsBaseStats } from '../../domain/unit/unitRepository';

import { BuildingType } from '../../types/Building';
import { TreasureType } from '../../types/Treasures';
import { HeroUnitType, UnitType } from '../../types/UnitType';
import { SpellName } from '../../types/Spell';

export const startRecruiting = (
  state: GameState,
  landPos: LandPosition,
  unitType: UnitType
): void => {
  if (getLandOwner(state, landPos) !== state.turnOwner) {
    return; // fallback: a wrong Land Owner should never happen on real game
  }
  // recruitment available only in MAIN phase if there is a slot available
  const building = getLand(state, landPos).buildings.filter(
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

    const turnOwner = getTurnOwner(state);
    const availableGold = turnOwner.vault;
    if (availableGold != null && availableGold >= unitsBaseStats(unitType).recruitCost) {
      const hasCrownOfDominion = hasTreasureByPlayer(turnOwner, TreasureType.CROWN_OF_DOMINION);

      const costReduction = hasCrownOfDominion
        ? Math.ceil(unitsBaseStats(unitType).recruitCost * 0.85)
        : unitsBaseStats(unitType).recruitCost;

      // Ember raid increases recruitment duration by 1 turn
      const hasEmberRaidEffect = getLand(state, landPos).effects?.some(
        (e) => e.spell === SpellName.EMBER_RAID
      );

      Object.assign(state, updatePlayerVault(state, turnOwner.id, -costReduction));

      // Add a recruitment slot using direct mutation
      building[0].slots!.push({
        unit: unitType,
        turnsRemaining:
          getRecruitDuration(unitType) +
          (hasEmberRaidEffect ? 1 : 0) +
          (getLand(state, landPos).corrupted ? 1 : 0), // corrupted lands add one additional turn to recruitment
      });
    }
  }
};
