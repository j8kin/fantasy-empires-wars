import React, { useCallback } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageType, Slot } from '../fantasy-book-dialog-template/FlipBookPage';

import { getTurnOwner } from '../../types/GameState';
import { BuildingType } from '../../types/Building';
import { getDefaultUnit, HeroUnitType, RegularUnitType } from '../../types/Army';
import { getLand, getLands } from '../../map/utils/getLands';

import { getUnitImg } from '../../assets/getUnitImg';

const RecruitArmyDialog: React.FC = () => {
  const { showRecruitArmyDialog, setShowRecruitArmyDialog } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleClose = useCallback(() => {
    setShowRecruitArmyDialog(false);
  }, [setShowRecruitArmyDialog]);

  if (!gameState || !showRecruitArmyDialog) return null;

  const landId = getLands({
    lands: gameState.battlefield.lands,
    players: [getTurnOwner(gameState)!],
    buildings: [BuildingType.BARRACKS],
  })[0];

  const availableUnits = getLand(gameState!, landId.mapPos).buildings.some(
    (b) => b.id === BuildingType.BARRACKS
  )
    ? Object.values(RegularUnitType).map((ut) => getDefaultUnit(ut))
    : Object.values(HeroUnitType).map((h) => getDefaultUnit(h));

  const slots: Slot[] = [
    { id: 'buildSlot1', name: 'Available 1' },
    { id: 'buildSlot2', name: 'Available 2' },
    { id: 'buildSlot3', name: 'Available 3' },
  ];

  return (
    <FlipBook onClickOutside={handleClose}>
      {availableUnits.map((unit, index) => (
        <FlipBookPage
          dialogType={FlipBookPageType.RECRUIT}
          key={unit.id}
          pageNum={index}
          header={unit.id}
          iconPath={getUnitImg(unit.id)}
          description={'temp description'}
          cost={unit.recruitCost}
          costLabel="Recruit Cost"
          maintainCost={unit.maintainCost}
          onClose={handleClose}
          slots={slots}
          landId={landId.mapPos}
        />
      ))}
    </FlipBook>
  );
};

export default RecruitArmyDialog;
