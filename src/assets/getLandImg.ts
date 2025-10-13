import { LAND_TYPE } from '../types/Land';

import darkForestImg from './map-tiles/darkforest.png';
import greenForestImg from './map-tiles/greenforest.png';
import hillsImg from './map-tiles/hills.png';
import lavaImg from './map-tiles/lava.png';
import mountainsImg from './map-tiles/mountains.png';
import plainsImg from './map-tiles/plains.png';
import swampImg from './map-tiles/swamp.png';
import desertImg from './map-tiles/desert.png';
import volcanoImg from './map-tiles/volcano.png';

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
