import React, { useCallback } from 'react';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageTypeName } from '../fantasy-book-dialog-template/FlipBookPage';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { isItem } from '../../domain/treasure/treasureRepository';
import { getValidMagicLands } from '../../map/magic/getValidMagicLands';

import { getTreasureImg } from '../../assets/getTreasureImg';

import type { Item } from '../../types/Treasures';

const EmpireTreasureDialog: React.FC = () => {
  const {
    showEmpireTreasureDialog,
    setShowEmpireTreasureDialog,
    setSelectedLandAction,
    addGlowingTile,
  } = useApplicationContext();

  const handleDialogClose = useCallback(() => {
    setShowEmpireTreasureDialog(false);
  }, [setShowEmpireTreasureDialog]);

  const { gameState } = useGameContext();

  const createItemClickHandler = useCallback(
    (item: Item) => {
      return () => {
        setSelectedLandAction(`${FlipBookPageTypeName.ITEM}: ${item.id}`);

        // Add tiles to the glowing tiles set for visual highlighting
        getValidMagicLands(gameState!, item.treasure.type).forEach((tileId) => {
          addGlowingTile(tileId);
        });

        handleDialogClose();
      };
    },
    [gameState, setSelectedLandAction, addGlowingTile, handleDialogClose]
  );

  if (!gameState || !showEmpireTreasureDialog) return null;

  const availableItems = getTurnOwner(gameState).empireTreasures.sort(
    (a, b) => Number(!isItem(a)) - Number(!isItem(b))
  );

  if (availableItems.length === 0) return null;

  return (
    <FlipBook onClickOutside={handleDialogClose}>
      {availableItems.map((treasure, index) => (
        <FlipBookPage
          key={treasure.treasure.type}
          pageNum={index}
          lorePage={913}
          header={treasure.treasure.type}
          iconPath={getTreasureImg(treasure)}
          description={treasure.treasure.description}
          onClose={handleDialogClose}
          // Relic items are permanent, and they are not "usable" that is why disable click on them
          onIconClick={
            isItem(treasure) && treasure.treasure.isConsumable
              ? createItemClickHandler(treasure)
              : undefined
          }
        />
      ))}
    </FlipBook>
  );
};
export default EmpireTreasureDialog;
