import React, { useCallback, useEffect } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import { getTurnOwner } from '../../selectors/playerSelectors';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageType } from '../fantasy-book-dialog-template/FlipBookPage';

import { BuildingType, getAllBuildings } from '../../types/Building';
import { getAvailableToConstructLands } from '../../map/building/getAvailableToConstructLands';
import { getLands } from '../../map/utils/getLands';

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
    if (selectedLandAction && showConstructBuildingDialog && gameState != null) {
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

  if (!gameState || !showConstructBuildingDialog) return null;

  const landsWithoutBuildings = getLands({
    gameState: gameState,
    players: [getTurnOwner(gameState).id],
    buildings: [],
  });
  if (landsWithoutBuildings.length === 0) {
    // trying to allocate lands where only WALLS are constructed (if barracks allowed then other buildings are allowed)
    if (getAvailableToConstructLands(gameState!, BuildingType.BARRACKS).length === 0) {
      // probably only WALLS are allowed to be constructed
      if (getAvailableToConstructLands(gameState!, BuildingType.WALL).length === 0) {
        return null;
      }
    }
  }
  const isStrongholdAllowed =
    getAvailableToConstructLands(gameState!, BuildingType.STRONGHOLD).length > 0;

  const selectedPlayer = getTurnOwner(gameState);
  const availableBuildings = selectedPlayer
    ? getAllBuildings(selectedPlayer).filter(
        (building) =>
          building.buildCost <= selectedPlayer.vault! &&
          (building.id !== BuildingType.STRONGHOLD || isStrongholdAllowed)
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
