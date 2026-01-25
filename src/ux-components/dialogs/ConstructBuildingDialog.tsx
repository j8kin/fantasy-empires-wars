import React, { useCallback } from 'react';
import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageTypeName } from '../fantasy-book-dialog-template/FlipBookPage';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { landIdToPosition } from '../../state/map/land/LandId';
import { getAllowedBuildings, getTurnOwner } from '../../selectors/playerSelectors';
import { getPlayerLands } from '../../selectors/landSelectors';
import { isWarsmithPresent } from '../../selectors/armySelectors';
import { getAvailableToConstructLands } from '../../map/building/getAvailableToConstructLands';
import { getBuildingImg } from '../../assets/getBuildingImg';
import { Doctrine } from '../../state/player/PlayerProfile';
import { BuildingName } from '../../types/Building';
import type { BuildingType } from '../../types/Building';

const ConstructBuildingDialog: React.FC = () => {
  const { showConstructBuildingDialog, setShowConstructBuildingDialog, setSelectedLandAction, addGlowingTile } =
    useApplicationContext();
  const { gameState } = useGameContext();

  const handleClose = useCallback(() => {
    setShowConstructBuildingDialog(false);
  }, [setShowConstructBuildingDialog]);

  const createBuildingClickHandler = useCallback(
    (buildingType: BuildingType) => {
      return () => {
        setSelectedLandAction(`${FlipBookPageTypeName.BUILDING}: ${buildingType}`);
        const turnOwner = getTurnOwner(gameState!);

        // Add tiles to the glowing tiles set for visual highlighting
        getAvailableToConstructLands(gameState!, buildingType).forEach((tileId) => {
          if (
            turnOwner.playerProfile.doctrine !== Doctrine.DRIVEN ||
            isWarsmithPresent(gameState!, landIdToPosition(tileId))
          ) {
            addGlowingTile(tileId);
          }
        });

        handleClose();
      };
    },
    [gameState, setSelectedLandAction, addGlowingTile, handleClose]
  );

  if (!showConstructBuildingDialog || gameState == null) return null;

  const turnOwner = getTurnOwner(gameState);

  const landsWithoutBuildings = getPlayerLands(gameState).filter((l) => l.buildings.length === 0);

  if (landsWithoutBuildings.length === 0) {
    // trying to allocate lands where only WALLS are constructed (if barracks allowed then other buildings are allowed)
    if (getAvailableToConstructLands(gameState!, BuildingName.BARRACKS).length === 0) {
      // probably only WALLS are allowed to be constructed
      if (getAvailableToConstructLands(gameState!, BuildingName.WALL).length === 0) {
        return null;
      }
    }
  }

  const isStrongholdAllowed = getAvailableToConstructLands(gameState, BuildingName.STRONGHOLD).length > 0;

  const availableBuildings = getAllowedBuildings(turnOwner).filter(
    (building) =>
      (building.type !== BuildingName.STRONGHOLD || isStrongholdAllowed) &&
      (building.type !== BuildingName.BARRACKS || turnOwner.playerProfile.doctrine !== Doctrine.PURE_MAGIC)
  );

  if (availableBuildings.length === 0) return null;

  return (
    <FlipBook onClickOutside={handleClose}>
      {availableBuildings.map((building, index) => (
        <FlipBookPage
          key={building.type}
          pageNum={index}
          lorePage={2351}
          header={building.type}
          iconPath={getBuildingImg(building.type)}
          description={building.description}
          cost={building.buildCost}
          costLabel="Build Cost"
          maintainCost={building.maintainCost}
          onClose={handleClose}
          onIconClick={createBuildingClickHandler(building.type)}
        />
      ))}
    </FlipBook>
  );
};

export default ConstructBuildingDialog;
