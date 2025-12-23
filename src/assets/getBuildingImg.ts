import { BuildingName } from '../types/Building';
import type { BuildingType } from '../types/Building';

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
    case BuildingName.STRONGHOLD:
      return strongholdImg;
    case BuildingName.BARRACKS:
      return barracksImg;
    case BuildingName.WHITE_MAGE_TOWER:
      return mageTowerWhite;
    case BuildingName.BLUE_MAGE_TOWER:
      return mageTowerBlue;
    case BuildingName.GREEN_MAGE_TOWER:
      return mageTowerGreen;
    case BuildingName.RED_MAGE_TOWER:
      return mageTowerRed;
    case BuildingName.BLACK_MAGE_TOWER:
      return mageTowerBlack;
    case BuildingName.OUTPOST:
      return outpostImg;
    case BuildingName.WATCH_TOWER:
      return watchTowerImg;
    case BuildingName.WALL:
      return wallImg;
    case BuildingName.DEMOLITION:
      return demolishImg;
    default:
      return undefined;
  }
};
