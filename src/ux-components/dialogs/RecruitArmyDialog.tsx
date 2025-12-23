import React, { useCallback, useEffect, useMemo, useState } from 'react';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage from '../fantasy-book-dialog-template/FlipBookPage';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getLand } from '../../selectors/landSelectors';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getAvailableSlotsCount, hasAvailableSlot } from '../../selectors/buildingSelectors';
import { isWarMachine, isMageType, isHeroType } from '../../domain/unit/unitTypeChecks';
import { unitsBaseStats } from '../../domain/unit/unitRepository';
import { startRecruiting } from '../../map/recruiting/startRecruiting';

import { getUnitImg } from '../../assets/getUnitImg';

import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import { BuildingType } from '../../types/Building';
import type { Slot } from '../fantasy-book-dialog-template/FlipBookPage';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { UnitType } from '../../types/UnitType';

interface RecruitUnitProps {
  id: UnitType;
  recruitCost: number;
  description: string;
}

const RecruitArmyDialog: React.FC = () => {
  const {
    showRecruitArmyDialog,
    setShowRecruitArmyDialog,
    actionLandPosition,
    setActionLandPosition,
  } = useApplicationContext();
  const { gameState } = useGameContext();

  // Shared state to track used slots across all pages
  const [usedSlots, setUsedSlots] = useState<Set<string>>(new Set());

  // Memoize the initial slot count so it doesn't change during the dialog session
  const initialSlotCount = useMemo(() => {
    if (!gameState || !actionLandPosition) return 0;

    const recruitBuilding = getLand(gameState, actionLandPosition).buildings.find((b) =>
      hasAvailableSlot(b)
    );

    return recruitBuilding ? getAvailableSlotsCount(recruitBuilding) : 0;
  }, [gameState, actionLandPosition]); // Only recalculate when dialog opens or land changes

  const handleClose = useCallback(() => {
    setShowRecruitArmyDialog(false);
    // Reset used slots when dialog closes
    setUsedSlots(new Set());
    // Clear the recruitment land position
    setActionLandPosition(undefined);
  }, [setShowRecruitArmyDialog, setActionLandPosition]);

  // Use effect to close dialog when no slots are available (moved from render to avoid state update during render)
  useEffect(() => {
    if (!gameState || !showRecruitArmyDialog || !actionLandPosition) return;

    const land = getLand(gameState, actionLandPosition);

    const recruitBuilding = land.buildings.find((b) => hasAvailableSlot(b));

    if (!recruitBuilding && showRecruitArmyDialog) {
      handleClose();
    }
  }, [gameState, showRecruitArmyDialog, actionLandPosition, handleClose]);

  const createSlotClickHandler = useCallback(
    (unitType: UnitType, landPos: LandPosition) => {
      return (slot: Slot) => {
        startRecruiting(gameState!, landPos, unitType);
        // Mark the slot as used across all pages
        setUsedSlots((prev) => new Set(prev).add(slot.id));
      };
    },
    [gameState]
  );

  const createRecruitClickHandler = useCallback(
    (unitType: UnitType, landPos: LandPosition) => {
      return () => {
        const building = getLand(gameState!, landPos).buildings.find((b) => hasAvailableSlot(b))!;
        const availableSlots = getAvailableSlotsCount(building);
        // recruit the same unit for all available slots
        for (let i = 0; i < availableSlots; i++) {
          startRecruiting(gameState!, landPos, unitType);
        }
        handleClose();
      };
    },
    [gameState, handleClose]
  );

  if (!gameState || !showRecruitArmyDialog || !actionLandPosition) return null;

  // Use the fixed initial slot count instead of recalculating
  if (initialSlotCount === 0) {
    setShowRecruitArmyDialog(false);
    return null;
  }

  const land = getLand(gameState, actionLandPosition);

  const recruitBuilding = land.buildings.find((b) => hasAvailableSlot(b));

  // If no recruit building is available (all slots filled), don't render content
  if (!recruitBuilding) return null;

  const sortArmyUnits = (unit: RecruitUnitProps): number => {
    if (unit.id === RegularUnitType.WARD_HANDS) return 0;
    if (isWarMachine(unit.id)) return 2;
    if (isHeroType(unit.id)) return 3;
    return 1;
  };

  const typeToRecruitProps = (unitType: UnitType): RecruitUnitProps => {
    const baseUnitStats = unitsBaseStats(unitType);
    return {
      id: unitType,
      recruitCost: baseUnitStats.recruitCost,
      description: baseUnitStats.description,
    };
  };
  const availableUnits: RecruitUnitProps[] = land.land.unitsToRecruit
    .filter(
      (u) =>
        // non-mages should be recruited in BARRACKS only
        (recruitBuilding.type === BuildingType.BARRACKS &&
          !isMageType(u) &&
          // The players, who reject magic, should be able to recruit their owned special heroes
          (u !== HeroUnitType.WARSMITH ||
            getTurnOwner(gameState).playerProfile.type === HeroUnitType.WARSMITH)) ||
        // mage Heroes should be recruited in related towers only
        (u === HeroUnitType.CLERIC && recruitBuilding.type === BuildingType.WHITE_MAGE_TOWER) ||
        (u === HeroUnitType.ENCHANTER && recruitBuilding.type === BuildingType.BLUE_MAGE_TOWER) ||
        (u === HeroUnitType.DRUID && recruitBuilding.type === BuildingType.GREEN_MAGE_TOWER) ||
        (u === HeroUnitType.PYROMANCER && recruitBuilding.type === BuildingType.RED_MAGE_TOWER) ||
        (u === HeroUnitType.NECROMANCER && recruitBuilding.type === BuildingType.BLACK_MAGE_TOWER)
    )
    .map((unit) => typeToRecruitProps(unit))
    .sort((a, b) => sortArmyUnits(a) - sortArmyUnits(b));

  const slots: Slot[] = [];
  for (let i = 0; i < initialSlotCount; i++) {
    slots.push({ id: `buildSlot${i + 1}`, name: `Available` });
  }

  return (
    <FlipBook onClickOutside={handleClose}>
      {availableUnits.map((unit, index) => (
        <FlipBookPage
          key={unit.id}
          pageNum={index}
          lorePage={617}
          header={unit.id}
          iconPath={getUnitImg(unit.id)}
          description={unit.description}
          cost={unit.recruitCost}
          onClose={handleClose}
          slots={slots}
          onSlotClick={createSlotClickHandler(unit.id, actionLandPosition)}
          onIconClick={createRecruitClickHandler(unit.id, actionLandPosition)}
          usedSlots={usedSlots}
        />
      ))}
    </FlipBook>
  );
};

export default RecruitArmyDialog;
