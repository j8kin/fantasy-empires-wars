import React, { Activity, useCallback, useEffect } from 'react';
import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageTypeName } from '../fantasy-book-dialog-template/FlipBookPage';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getPlayerLands } from '../../selectors/landSelectors';
import { getAllBuildings } from '../../domain/building/buildingRepository';
import { getAvailableToConstructLands } from '../../map/building/getAvailableToConstructLands';

import { getBuildingImg } from '../../assets/getBuildingImg';

import type { BuildingType } from '../../types/Building';
import { BuildingName } from '../../types/Building';

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
        setSelectedLandAction(`${FlipBookPageTypeName.BUILDING}: ${buildingType}`);

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

  const turnOwner = gameState ? getTurnOwner(gameState) : undefined;

  const landsWithoutBuildings =
    gameState != null ? getPlayerLands(gameState).filter((l) => l.buildings.length === 0) : [];

  if ((gameState != null && landsWithoutBuildings.length) === 0) {
    // trying to allocate lands where only WALLS are constructed (if barracks allowed then other buildings are allowed)
    if (getAvailableToConstructLands(gameState!, BuildingName.BARRACKS).length === 0) {
      // probably only WALLS are allowed to be constructed
      if (getAvailableToConstructLands(gameState!, BuildingName.WALL).length === 0) {
        return null;
      }
    }
  }

  const isStrongholdAllowed =
    gameState != null &&
    getAvailableToConstructLands(gameState, BuildingName.STRONGHOLD).length > 0;

  const availableBuildings = turnOwner
    ? getAllBuildings(turnOwner).filter(
        (building) =>
          building.buildCost <= turnOwner.vault! &&
          (building.id !== BuildingName.STRONGHOLD || isStrongholdAllowed)
      )
    : [];

  return (
    <Activity
      mode={showConstructBuildingDialog && availableBuildings.length > 0 ? 'visible' : 'hidden'}
    >
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
    </Activity>
  );
};

export default ConstructBuildingDialog;
