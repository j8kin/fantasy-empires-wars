import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { Slot } from '../fantasy-book-dialog-template/FlipBookPage';

import { LandPosition } from '../../state/LandState';

import { getDefaultUnit, isHero, isMage, Unit } from '../../types/Unit';
import { isWarMachine, HeroUnitType, RegularUnitType, UnitType } from '../../types/UnitType';

import { BuildingType } from '../../types/Building';

import { startRecruiting } from '../../map/recruiting/startRecruiting';

import { getUnitImg } from '../../assets/getUnitImg';

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

    const land = gameState.getLand(actionLandPosition);
    if (!land) return 0;

    const recruitBuilding = land.buildings.filter(
      (b) => b.slots != null && b.numberOfSlots > 0 && b.slots?.length < b.numberOfSlots
    )[0];

    return (recruitBuilding?.numberOfSlots ?? 0) - (recruitBuilding?.slots?.length ?? 0);
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

    const land = gameState.getLand(actionLandPosition);
    if (!land) return;

    const recruitBuilding = land.buildings.filter(
      (b) => b.slots != null && b.numberOfSlots > 0 && b.slots?.length < b.numberOfSlots
    )[0];

    if (!recruitBuilding && showRecruitArmyDialog) {
      handleClose();
    }
  }, [gameState, showRecruitArmyDialog, actionLandPosition, handleClose]);

  const createSlotClickHandler = useCallback(
    (unitType: UnitType, landPos: LandPosition) => {
      return (slot: Slot) => {
        startRecruiting(unitType, landPos, gameState!);
        // Mark the slot as used across all pages
        setUsedSlots((prev) => new Set(prev).add(slot.id));
      };
    },
    [gameState]
  );

  const createRecruitClickHandler = useCallback(
    (unitType: UnitType, landPos: LandPosition) => {
      return () => {
        const building = gameState!.getLand(landPos).buildings.find((b) => b.slots != null)!;
        const availableSlots = building.numberOfSlots - (building.slots?.length ?? 0);
        // recruit the same unit for all available slots
        for (let i = 0; i < availableSlots; i++) {
          startRecruiting(unitType, landPos, gameState!);
        }
        handleClose();
      };
    },
    [gameState, handleClose]
  );

  if (!gameState || !showRecruitArmyDialog || !actionLandPosition) return undefined;

  // Use the fixed initial slot count instead of recalculating
  if (initialSlotCount === 0) {
    setShowRecruitArmyDialog(false);
    return undefined;
  }

  const land = gameState.getLand(actionLandPosition);

  const recruitBuilding = land.buildings.filter(
    (b) => b.slots != null && b.numberOfSlots > 0 && b.slots?.length < b.numberOfSlots
  )[0];

  // If no recruit building is available (all slots filled), don't render content
  if (!recruitBuilding) {
    return null;
  }

  const sortArmyUnits = (unit: Unit): number => {
    if (unit.id === RegularUnitType.WARD_HANDS) return 0;
    if (isWarMachine(unit.id)) return 2;
    if (isHero(unit)) return 3;
    return 1;
  };

  const availableUnits = land.land.unitsToRecruit
    .filter(
      (u) =>
        // non-mages should be recruited in BARRACKS only
        (recruitBuilding.id === BuildingType.BARRACKS &&
          !isMage(u) &&
          // The players, who reject magic, should be able to recruit their owned special heroes
          (u !== HeroUnitType.WARSMITH ||
            gameState?.turnOwner.getType() === HeroUnitType.WARSMITH)) ||
        // mage Heroes should be recruited in related towers only
        (u === HeroUnitType.CLERIC && recruitBuilding.id === BuildingType.WHITE_MAGE_TOWER) ||
        (u === HeroUnitType.ENCHANTER && recruitBuilding.id === BuildingType.BLUE_MAGE_TOWER) ||
        (u === HeroUnitType.DRUID && recruitBuilding.id === BuildingType.GREEN_MAGE_TOWER) ||
        (u === HeroUnitType.PYROMANCER && recruitBuilding.id === BuildingType.RED_MAGE_TOWER) ||
        (u === HeroUnitType.NECROMANCER && recruitBuilding.id === BuildingType.BLACK_MAGE_TOWER)
    )
    .map((unit) => getDefaultUnit(unit))
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
