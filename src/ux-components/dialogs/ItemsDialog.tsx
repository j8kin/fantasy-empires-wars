import React, { useCallback } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage from '../fantasy-book-dialog-template/FlipBookPage';

import { getTurnOwner } from '../../selectors/playerSelectors';
import { isRelic, Item } from '../../types/Treasures';

import { getTreasureImg } from '../../assets/getTreasureImg';

const ItemsDialog: React.FC = () => {
  const { setShowItemsDialog } = useApplicationContext();

  const handleDialogClose = useCallback(() => {
    setShowItemsDialog(false);
  }, [setShowItemsDialog]);

  const createItemClickHandler = useCallback(
    (item: Item) => {
      return () => {
        handleDialogClose();
      };
    },
    [handleDialogClose]
  );

  const { gameState } = useGameContext();
  if (!gameState) return null;

  const availableItems = getTurnOwner(gameState).empireTreasures.sort(
    (a, b) => Number(isRelic(a)) - Number(isRelic(b))
  );

  return availableItems.length > 0 ? (
    <FlipBook onClickOutside={handleDialogClose}>
      {availableItems.map((treasure, index) => (
        <FlipBookPage
          key={treasure.id}
          pageNum={index}
          lorePage={913}
          header={treasure.id}
          iconPath={getTreasureImg(treasure)}
          description={treasure.description}
          onClose={handleDialogClose}
          // Relic items are permanent, and they are not "usable" that is why disable click on them
          onIconClick={isRelic(treasure) ? undefined : createItemClickHandler(treasure)}
        />
      ))}
    </FlipBook>
  ) : null;
};
export default ItemsDialog;
