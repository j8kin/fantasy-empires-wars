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

const buildingImg: Record<BuildingType, string> = {
  [BuildingName.STRONGHOLD]: strongholdImg,
  [BuildingName.BARRACKS]: barracksImg,
  [BuildingName.WHITE_MAGE_TOWER]: mageTowerWhite,
  [BuildingName.BLUE_MAGE_TOWER]: mageTowerBlue,
  [BuildingName.GREEN_MAGE_TOWER]: mageTowerGreen,
  [BuildingName.RED_MAGE_TOWER]: mageTowerRed,
  [BuildingName.BLACK_MAGE_TOWER]: mageTowerBlack,
  [BuildingName.OUTPOST]: outpostImg,
  [BuildingName.WATCH_TOWER]: watchTowerImg,
  [BuildingName.WALL]: wallImg,
  [BuildingName.DEMOLITION]: demolishImg,
};

export const getBuildingImg = (building: BuildingType) => {
  return buildingImg[building];
};
