import React, { useCallback, useEffect } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageType } from '../fantasy-book-dialog-template/FlipBookPage';

import { getAllBuildings, BuildingType } from '../../types/Building';
import { getTurnOwner } from '../../types/GameState';
import { getAvailableToConstructLands } from '../../map/building/getAvailableToConstructLands';

import { getBuildingImg } from '../../assets/getBuildingImg';

const ConstructBuildingDialog: React.FC = () => {
  const {
    showConstructBuildingDialog,
    setShowConstructBuildingDialog,
    selectedLandAction,
    setSelectedLandAction,
    addGlowingTile,
  } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleClose = useCallback(() => {
    setShowConstructBuildingDialog(false);
  }, [setShowConstructBuildingDialog]);

  const createBuildingClickHandler = useCallback(
    (buildingType: BuildingType) => {
      return () => {
        setSelectedLandAction(`${FlipBookPageType.BUILDING}: ${buildingType}`);

        // Add tiles to the glowing tiles set for visual highlighting
        getAvailableToConstructLands(gameState!, buildingType).forEach((tileId) => {
          addGlowingTile(tileId);
        });

        handleClose();
      };
    },
    [gameState, setSelectedLandAction, addGlowingTile, handleClose]
  );

  useEffect(() => {
    if (selectedLandAction && showConstructBuildingDialog) {
      const selectedPlayer = getTurnOwner(gameState);
      if (selectedPlayer) {
        const building = getAllBuildings(selectedPlayer).find((s) => s.id === selectedLandAction);
        if (building) {
          setTimeout(() => {
            alert(
              `Construct ${building.id}!\n\nBuild Cost: ${building.buildCost}\n\nEffect: ${building.description}`
            );
            handleClose();
          }, 100);
        }
      }
    }
  }, [gameState, handleClose, selectedLandAction, showConstructBuildingDialog]);

  if (!showConstructBuildingDialog) return null;

  const selectedPlayer = getTurnOwner(gameState);
  const availableBuildings = selectedPlayer
    ? getAllBuildings(selectedPlayer).filter(
        (building) => building.buildCost <= selectedPlayer.vault!
      )
    : [];

  return (
    <FlipBook onClickOutside={handleClose}>
      {availableBuildings.map((building, index) => (
        <FlipBookPage
          key={building.id}
          pageNum={index}
          lorePage={2351}
          header={building.id}
          iconPath={getBuildingImg(building.id)}
          description={building.description}
          cost={building.buildCost}
          costLabel="Build Cost"
          maintainCost={building.maintainCost}
          onClose={handleClose}
          onIconClick={createBuildingClickHandler(building.id as BuildingType)}
        />
      ))}
    </FlipBook>
  );
};

export default ConstructBuildingDialog;
