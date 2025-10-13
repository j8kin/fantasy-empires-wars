import { BuildingType } from '../types/Building';

import strongholdImg from './buildings/stronghold.png';
import barracksImg from './buildings/barracks.png';
import watchTowerImg from './buildings/watchtower.png';
import outpostImg from './buildings/outpost.png';
import wallImg from './buildings/wall.png';

export const getBuildingImg = (building: BuildingType) => {
  switch (building) {
    case BuildingType.STRONGHOLD:
      return strongholdImg;
    case BuildingType.BARRACKS:
      return barracksImg;
    case BuildingType.MAGE_TOWER:
      return undefined;
    case BuildingType.OUTPOST:
      return outpostImg;
    case BuildingType.WATCH_TOWER:
      return watchTowerImg;
    case BuildingType.WALL:
      return wallImg;
    default:
      return undefined;
  }
};
