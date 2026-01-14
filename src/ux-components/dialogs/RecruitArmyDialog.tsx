import React, { useCallback, useEffect, useMemo, useState } from 'react';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import type { Slot } from '../fantasy-book-dialog-template/FlipBookPage';
import FlipBookPage from '../fantasy-book-dialog-template/FlipBookPage';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getBuilding, getLand } from '../../selectors/landSelectors';
import { getTurnOwner, getUnitsAllowedToRecruit } from '../../selectors/playerSelectors';
import { getAvailableSlotsCount, hasAvailableSlot } from '../../selectors/buildingSelectors';
import { isHeroType, isRegularUnit, isWarMachine } from '../../domain/unit/unitTypeChecks';
import { getRecruitInfo } from '../../domain/unit/unitRepository';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { getUnitImg } from '../../assets/getUnitImg';
import { RegularUnitName } from '../../types/UnitType';
import { Doctrine } from '../../state/player/PlayerProfile';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { UnitType } from '../../types/UnitType';

interface RecruitUnitProps {
  type: UnitType;
  recruitCost: number;
  description: string;
}

const sortArmyUnits = (unit: RecruitUnitProps): number => {
  if (unit.type === RegularUnitName.WARD_HANDS) return 0;
  if (isWarMachine(unit.type)) return 2;
  if (isHeroType(unit.type)) return 3;
  return 1;
};

const typeToRecruitProps = (unitType: UnitType): RecruitUnitProps => {
  const recruitInfo = getRecruitInfo(unitType);
  return {
    type: unitType,
    recruitCost: recruitInfo.recruitCost,
    description: recruitInfo.description,
  };
};

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

    return getAvailableSlotsCount(recruitBuilding);
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
    (unitType: UnitType, landPos: LandPosition): ((availableSlots: Slot[]) => void) => {
      return (availableSlots: Slot[]) => {
        const buildingId = getLand(gameState!, landPos).buildings.find((b) =>
          hasAvailableSlot(b)
        )!.id;

        const building = getBuilding(getLand(gameState!, landPos), buildingId);

        const initialAvailable = getAvailableSlotsCount(building);

        // recruit the same unit for all available slots
        for (let i = 0; i < initialAvailable; i++) {
          startRecruiting(gameState!, landPos, unitType);
        }

        const updatedBuilding = getBuilding(getLand(gameState!, landPos), buildingId);

        const recruitedInThisClick = initialAvailable - getAvailableSlotsCount(updatedBuilding);

        // Mark only actually recruited slots as used
        setUsedSlots((prev) => {
          const newUsedSlots = new Set(prev);
          for (let i = 0; i < recruitedInThisClick; i++) {
            if (availableSlots && availableSlots[i] != null) newUsedSlots.add(availableSlots[i].id);
          }
          return newUsedSlots;
        });
      };
    },
    [gameState]
  );

  const isRegularAntiMagic = (unitType: UnitType) => {
    return isRegularUnit(unitType) && turnOwner.playerProfile.doctrine === Doctrine.ANTI_MAGIC;
  };

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

  const turnOwner = getTurnOwner(gameState);

  const availableUnits: RecruitUnitProps[] = getUnitsAllowedToRecruit(
    turnOwner,
    land,
    recruitBuilding
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
          key={unit.type}
          pageNum={index}
          lorePage={617}
          header={`${unit.type}${isRegularAntiMagic(unit.type) ? ' Nullwarden' : ''}`}
          iconPath={getUnitImg(unit.type, turnOwner.playerProfile.doctrine)}
          description={unit.description}
          cost={unit.recruitCost}
          onClose={handleClose}
          slots={slots}
          onSlotClick={createSlotClickHandler(unit.type, actionLandPosition)}
          onIconClick={createRecruitClickHandler(unit.type, actionLandPosition)}
          usedSlots={usedSlots}
        />
      ))}
    </FlipBook>
  );
};

export default RecruitArmyDialog;
