import React, { useCallback, useEffect } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage from '../fantasy-book-dialog-template/FlipBookPage';

import { getAllBuildings } from '../../types/Building';

import { getBuildingImg } from '../../assets/getBuildingImg';

const ConstructBuildingDialog: React.FC = () => {
  const { showConstructBuildingDialog, setShowConstructBuildingDialog, selectedLandAction } =
    useApplicationContext();
  const { gameState } = useGameContext();

  const handleClose = useCallback(() => {
    setShowConstructBuildingDialog(false);
  }, [setShowConstructBuildingDialog]);

  useEffect(() => {
    if (selectedLandAction && showConstructBuildingDialog) {
      const building = getAllBuildings(gameState?.selectedPlayer!).find(
        (s) => s.id === selectedLandAction
      );
      if (building) {
        setTimeout(() => {
          alert(
            `Construct ${building.id}!\n\nBuild Cost: ${building.buildCost}\n\nEffect: ${building.description}`
          );
          handleClose();
        }, 100);
      }
    }
  }, [gameState?.selectedPlayer, handleClose, selectedLandAction, showConstructBuildingDialog]);

  if (!showConstructBuildingDialog) return null;

  const availableBuildings = getAllBuildings(gameState?.selectedPlayer!).filter(
    (building) => building.buildCost <= gameState!.selectedPlayer.money!
  );

  return (
    <FlipBook onClickOutside={handleClose}>
      {availableBuildings.map((building, index) => (
        <FlipBookPage
          key={building.id}
          pageNum={index}
          header={building.id}
          iconPath={getBuildingImg(building.id)}
          description={building.description}
          cost={building.buildCost}
          costLabel="Build Cost"
          maintainCost={building.maintainCost}
          onClose={handleClose}
        />
      ))}
    </FlipBook>
  );
};

export default ConstructBuildingDialog;
