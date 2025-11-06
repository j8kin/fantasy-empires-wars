import React, { useCallback } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageType, Slot } from '../fantasy-book-dialog-template/FlipBookPage';

import { getTurnOwner } from '../../types/GameState';
import { BuildingType } from '../../types/Building';
import { getDefaultUnit, HeroUnitType, isHero, isMage } from '../../types/Army';
import { getLand, getLands } from '../../map/utils/getLands';

import { getUnitImg } from '../../assets/getUnitImg';

const RecruitArmyDialog: React.FC = () => {
  const { showRecruitArmyDialog, setShowRecruitArmyDialog } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleClose = useCallback(() => {
    setShowRecruitArmyDialog(false);
  }, [setShowRecruitArmyDialog]);

  if (!gameState || !showRecruitArmyDialog) return undefined;

  const land = getLands({
    lands: gameState.battlefield.lands,
    players: [getTurnOwner(gameState)!],
    buildings: [BuildingType.BARRACKS],
  })[0];

  const recruitBuilding = land.buildings.filter(
    (b) => b.slots != null && b.numberOfSlots > 0 && b.slots?.length < b.numberOfSlots
  )[0];

  const recruitSlots =
    (recruitBuilding?.numberOfSlots ?? 0) - (recruitBuilding?.slots?.length ?? 0);

  if (recruitSlots === 0) {
    setShowRecruitArmyDialog(false);
    return undefined;
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
  for (let i = 0; i < recruitSlots; i++) {
    slots.push({ id: `buildSlot${i + 1}`, name: `Available ${i + 1}` });
  }

  return (
    <FlipBook onClickOutside={handleClose}>
      {availableUnits.map((unit, index) => (
        <FlipBookPage
          dialogType={FlipBookPageType.RECRUIT}
          key={unit.id}
          pageNum={index}
          header={unit.id}
          iconPath={getUnitImg(unit.id)}
          description={unit.description}
          cost={unit.recruitCost}
          onClose={handleClose}
          slots={slots}
          landId={land.mapPos}
        />
      ))}
    </FlipBook>
  );
};

export default RecruitArmyDialog;
