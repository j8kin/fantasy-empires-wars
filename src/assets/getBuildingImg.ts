import { BuildingName } from '../types/Building';
import type { BuildingType } from '../types/Building';

import strongholdImg from './buildings/stronghold.png';
import barracksImg from './buildings/barracks.png';
import mageTowerWhite from './buildings/magic-tower.png';
import watchTowerImg from './buildings/watchtower.png';
import outpostImg from './buildings/outpost.png';
import wallImg from './buildings/wall.png';
import demolishImg from './buildings/demolish.png';

const buildingImg: Record<BuildingType, string> = {
  [BuildingName.STRONGHOLD]: strongholdImg,
  [BuildingName.BARRACKS]: barracksImg,
  [BuildingName.MAGE_TOWER]: mageTowerWhite,
  [BuildingName.OUTPOST]: outpostImg,
  [BuildingName.WATCH_TOWER]: watchTowerImg,
  [BuildingName.WALL]: wallImg,
  [BuildingName.DEMOLITION]: demolishImg,
};

export const getBuildingImg = (building: BuildingType) => {
  return buildingImg[building];
};
