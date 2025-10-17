import { BuildingType } from '../types/Building';

import strongholdImg from './buildings/stronghold.png';
import barracksImg from './buildings/barracks.png';
import mageTowerWhite from './buildings/magic-tower-white.png';
import mageTowerBlue from './buildings/magic-tower-blue.png';
import mageTowerGreen from './buildings/magic-tower-green.png';
import mageTowerRed from './buildings/magic-tower-red.png';
import mageTowerBlack from './buildings/magic-tower-black.png';
import watchTowerImg from './buildings/watchtower.png';
import outpostImg from './buildings/outpost.png';
import wallImg from './buildings/wall.png';
import demolishImg from './buildings/demolish.png';

export const getBuildingImg = (building: BuildingType) => {
  switch (building) {
    case BuildingType.STRONGHOLD:
      return strongholdImg;
    case BuildingType.BARRACKS:
      return barracksImg;
    case BuildingType.WHITE_MAGE_TOWER:
      return mageTowerWhite;
    case BuildingType.BLUE_MAGE_TOWER:
      return mageTowerBlue;
    case BuildingType.GREEN_MAGE_TOWER:
      return mageTowerGreen;
    case BuildingType.RED_MAGE_TOWER:
      return mageTowerRed;
    case BuildingType.BLACK_MAGE_TOWER:
      return mageTowerBlack;
    case BuildingType.OUTPOST:
      return outpostImg;
    case BuildingType.WATCH_TOWER:
      return watchTowerImg;
    case BuildingType.WALL:
      return wallImg;
    case BuildingType.DEMOLITION:
      return demolishImg;
    default:
      return undefined;
  }
};
