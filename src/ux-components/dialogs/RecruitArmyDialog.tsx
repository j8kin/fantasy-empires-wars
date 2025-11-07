import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { Slot } from '../fantasy-book-dialog-template/FlipBookPage';

import { getTurnOwner } from '../../types/GameState';
import { BuildingType } from '../../types/Building';
import { getDefaultUnit, HeroUnitType, isHero, isMage, UnitType } from '../../types/Army';
import { getLand, getLands, LandPosition } from '../../map/utils/getLands';
import { startRecruiting } from '../../map/recruiting/startRecruiting';

import { getUnitImg } from '../../assets/getUnitImg';

const RecruitArmyDialog: React.FC = () => {
  const { showRecruitArmyDialog, setShowRecruitArmyDialog } = useApplicationContext();
  const { gameState } = useGameContext();

  // Shared state to track used slots across all pages
  const [usedSlots, setUsedSlots] = useState<Set<string>>(new Set());

  // Memoize the initial slot count so it doesn't change during the dialog session
  const initialSlotCount = useMemo(() => {
    if (!gameState) return 0;

    const land = getLands({
      lands: gameState.battlefield.lands,
      players: [getTurnOwner(gameState)!],
      buildings: [BuildingType.BARRACKS],
    })[0];

    if (!land) return 0;

    const recruitBuilding = land.buildings.filter(
      (b) => b.slots != null && b.numberOfSlots > 0 && b.slots?.length < b.numberOfSlots
    )[0];

    return (recruitBuilding?.numberOfSlots ?? 0) - (recruitBuilding?.slots?.length ?? 0);
  }, [gameState]); // Only recalculate when dialog opens

  const handleClose = useCallback(() => {
    setShowRecruitArmyDialog(false);
    // Reset used slots when dialog closes
    setUsedSlots(new Set());
  }, [setShowRecruitArmyDialog]);

  // Use effect to close dialog when no slots are available (moved from render to avoid state update during render)
  useEffect(() => {
    if (!gameState || !showRecruitArmyDialog) return;

    const land = getLands({
      lands: gameState.battlefield.lands,
      players: [getTurnOwner(gameState)!],
      buildings: [BuildingType.BARRACKS],
    })[0];

    if (!land) return;

    const recruitBuilding = land.buildings.filter(
      (b) => b.slots != null && b.numberOfSlots > 0 && b.slots?.length < b.numberOfSlots
    )[0];

    if (!recruitBuilding && showRecruitArmyDialog) {
      console.log('No recruit building available, closing dialog');
      handleClose();
    }
  }, [gameState, showRecruitArmyDialog, handleClose]);

  const createSlotClickHandler = useCallback(
    (unitType: UnitType, landId: LandPosition) => {
      return (slot: Slot) => {
        startRecruiting(unitType, landId, gameState!);
        // Mark the slot as used across all pages
        setUsedSlots((prev) => new Set(prev).add(slot.id));
      };
    },
    [gameState]
  );

  const createRecruitClickHandler = useCallback(
    (unitType: UnitType, landId: LandPosition) => {
      return () => {
        startRecruiting(unitType, landId, gameState!);
        handleClose();
      };
    },
    [gameState, handleClose]
  );

  if (!gameState || !showRecruitArmyDialog) return undefined;

  // Use the fixed initial slot count instead of recalculating
  if (initialSlotCount === 0) {
    setShowRecruitArmyDialog(false);
    return undefined;
  }

  const land = getLands({
    lands: gameState.battlefield.lands,
    players: [getTurnOwner(gameState)!],
    buildings: [BuildingType.BARRACKS],
  })[0];

  const recruitBuilding = land.buildings.filter(
    (b) => b.slots != null && b.numberOfSlots > 0 && b.slots?.length < b.numberOfSlots
  )[0];

  // If no recruit building is available (all slots filled), don't render content
  if (!recruitBuilding) {
    return null;
  }

  const availableUnits = getLand(gameState!, land.mapPos)
    .land.unitsToRecruit.filter(
      (u) =>
        // non-mages should be recruited in BARRACKS only
        (recruitBuilding.id === BuildingType.BARRACKS &&
          !isMage(u) &&
          // The players, who reject magic, should be able to recruit their owned special heroes
          (u !== HeroUnitType.WARSMITH ||
            getTurnOwner(gameState)?.type === HeroUnitType.WARSMITH)) ||
        // mage Heroes should be recruited in related towers only
        (u === HeroUnitType.CLERIC && recruitBuilding.id === BuildingType.WHITE_MAGE_TOWER) ||
        (u === HeroUnitType.ENCHANTER && recruitBuilding.id === BuildingType.BLUE_MAGE_TOWER) ||
        (u === HeroUnitType.DRUID && recruitBuilding.id === BuildingType.GREEN_MAGE_TOWER) ||
        (u === HeroUnitType.PYROMANCER && recruitBuilding.id === BuildingType.RED_MAGE_TOWER) ||
        (u === HeroUnitType.NECROMANCER && recruitBuilding.id === BuildingType.BLACK_MAGE_TOWER)
    )
    .map((unit) => getDefaultUnit(unit))
    .sort((a, b) => Number(isHero(a)) - Number(isHero(b)));

  const slots: Slot[] = [];
  for (let i = 0; i < initialSlotCount; i++) {
    slots.push({ id: `buildSlot${i + 1}`, name: `Available ${i + 1}` });
  }

  return (
    <FlipBook onClickOutside={handleClose}>
      {availableUnits.map((unit, index) => (
        <FlipBookPage
          key={unit.id}
          pageNum={index}
          lorePage={517}
          header={unit.id}
          iconPath={getUnitImg(unit.id)}
          description={unit.description}
          cost={unit.recruitCost}
          onClose={handleClose}
          slots={slots}
          onSlotClick={createSlotClickHandler(unit.id, land.mapPos)}
          onIconClick={createRecruitClickHandler(unit.id, land.mapPos)}
          usedSlots={usedSlots}
        />
      ))}
    </FlipBook>
  );
};

export default RecruitArmyDialog;
