import React, { useCallback } from 'react';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage from '../fantasy-book-dialog-template/FlipBookPage';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { isRelic } from '../../domain/treasure/treasureRepository';

import { getTreasureImg } from '../../assets/getTreasureImg';

import type { Item } from '../../types/Treasures';

const EmpireTreasureDialog: React.FC = () => {
  const { showEmpireTreasureDialog, setShowEmpireTreasureDialog } = useApplicationContext();

  const handleDialogClose = useCallback(() => {
    setShowEmpireTreasureDialog(false);
  }, [setShowEmpireTreasureDialog]);

  const createItemClickHandler = useCallback(
    (item: Item) => {
      return () => {
        handleDialogClose();
      };
    },
    [handleDialogClose]
  );

  const { gameState } = useGameContext();
  if (!gameState || !showEmpireTreasureDialog) return null;

  const availableItems = getTurnOwner(gameState).empireTreasures.sort(
    (a, b) => Number(isRelic(a)) - Number(isRelic(b))
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
          onIconClick={isRelic(treasure) ? undefined : createItemClickHandler(treasure)}
        />
      ))}
    </FlipBook>
  );
};
export default EmpireTreasureDialog;
