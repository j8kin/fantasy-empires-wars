import { EmpireTreasure, TreasureItem } from '../types/Treasures';

import mirrorOfIllusionImg from './treasures/mirror-of-illusion.png';
import orbOfStormImg from './treasures/orb-of-storm.png';
import wandOfTurnUndeadImg from './treasures/turn-undead.png';
import phoenixFeatherImg from './treasures/phoenix-feather.png';

export const getTreasureImg = (treasure: EmpireTreasure) => {
  switch (treasure.id) {
    case TreasureItem.WAND_TURN_UNDEAD:
      return wandOfTurnUndeadImg;
    case TreasureItem.ORB_OF_STORM:
      return orbOfStormImg;
    case TreasureItem.RESURRECTION:
      return phoenixFeatherImg;
    case TreasureItem.MIRROR_OF_ILLUSION:
      return mirrorOfIllusionImg;
  }
  return undefined;
};
