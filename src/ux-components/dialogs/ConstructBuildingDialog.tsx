import React, { useCallback, useEffect } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage from '../fantasy-book-dialog-template/FlipBookPage';
import { BuildingType, getAllBuildings } from '../../types/Building';

import strongholdImg from '../../assets/buildings/stronghold.png';
import barracksImg from '../../assets/buildings/barracks.png';

const getBuildingIcon = (building: BuildingType) => {
  switch (building) {
    case BuildingType.STRONGHOLD:
      return strongholdImg;
    case BuildingType.BARRACKS:
      return barracksImg;
    case BuildingType.MAGE_TOWER:
    case BuildingType.OUTPOST:
    case BuildingType.WATCH_TOWER:
    case BuildingType.WALL:
    default:
      return undefined;
  }
};

const ConstructBuildingDialog: React.FC = () => {
  const {
    showConstructBuildingDialog,
    setShowConstructBuildingDialog,
    selectedItem,
    setSelectedItem,
  } = useApplicationContext();

  const handleClose = useCallback(() => {
    setSelectedItem(null);
    setShowConstructBuildingDialog(false);
  }, [setSelectedItem, setShowConstructBuildingDialog]);

  useEffect(() => {
    if (selectedItem && showConstructBuildingDialog) {
      const building = getAllBuildings().find((s) => s.id === selectedItem);
      if (building) {
        setTimeout(() => {
          alert(
            `Construct ${building.id}!\n\nBuild Cost: ${building.buildCost}\n\nEffect: ${building.description}`
          );
          handleClose();
        }, 100);
      }
    }
  }, [selectedItem, showConstructBuildingDialog, handleClose]);

  if (!showConstructBuildingDialog) return null;

  return (
    <FlipBook onClickOutside={handleClose}>
      {getAllBuildings().map((building, index) => (
        <FlipBookPage
          key={building.id}
          pageNum={index}
          header={building.id}
          iconPath={getBuildingIcon(building.id)}
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
