import { BuildingKind } from '../types/Building';
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
    case BuildingKind.STRONGHOLD:
      return strongholdImg;
    case BuildingKind.BARRACKS:
      return barracksImg;
    case BuildingKind.WHITE_MAGE_TOWER:
      return mageTowerWhite;
    case BuildingKind.BLUE_MAGE_TOWER:
      return mageTowerBlue;
    case BuildingKind.GREEN_MAGE_TOWER:
      return mageTowerGreen;
    case BuildingKind.RED_MAGE_TOWER:
      return mageTowerRed;
    case BuildingKind.BLACK_MAGE_TOWER:
      return mageTowerBlack;
    case BuildingKind.OUTPOST:
      return outpostImg;
    case BuildingKind.WATCH_TOWER:
      return watchTowerImg;
    case BuildingKind.WALL:
      return wallImg;
    case BuildingKind.DEMOLITION:
      return demolishImg;
    default:
      return undefined;
  }
};
