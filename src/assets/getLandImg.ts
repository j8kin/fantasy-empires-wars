import { LAND_TYPE } from '../types/Land';

import darkForestImg from './lands/darkforest.png';
import greenForestImg from './lands/greenforest.png';
import hillsImg from './lands/hills.png';
import lavaImg from './lands/lava.png';
import mountainsImg from './lands/mountains.png';
import plainsImg from './lands/plains.png';
import swampImg from './lands/swamp.png';
import desertImg from './lands/desert.png';
import volcanoImg from './lands/volcano.png';

export const getLandImg = (landType: LAND_TYPE): string | undefined => {
  switch (landType) {
    case LAND_TYPE.PLAINS:
      return plainsImg;
    case LAND_TYPE.HILLS:
      return hillsImg;
    case LAND_TYPE.MOUNTAINS:
      return mountainsImg;
    case LAND_TYPE.SWAMP:
      return swampImg;
    case LAND_TYPE.DESERT:
      return desertImg;
    case LAND_TYPE.GREEN_FOREST:
      return greenForestImg;
    case LAND_TYPE.DARK_FOREST:
      return darkForestImg;
    case LAND_TYPE.LAVA:
      return lavaImg;
    case LAND_TYPE.VOLCANO:
      return volcanoImg;
    default:
      return undefined;
  }
};
