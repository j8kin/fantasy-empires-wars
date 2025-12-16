import { TreasureType } from '../types/Treasures';
import { EmpireTreasure } from '../types/Treasures';

import mirrorOfIllusionImg from './treasures/mirror-of-illusion.png';
import orbOfStormImg from './treasures/orb-of-storm.png';
import wandOfTurnUndeadImg from './treasures/turn-undead.png';
import phoenixFeatherImg from './treasures/phoenix-feather.png';

export const getTreasureImg = (treasure: EmpireTreasure) => {
  switch (treasure.treasure.type) {
    case TreasureType.WAND_TURN_UNDEAD:
      return wandOfTurnUndeadImg;
    case TreasureType.ORB_OF_STORM:
      return orbOfStormImg;
    case TreasureType.RESURRECTION:
      return phoenixFeatherImg;
    case TreasureType.MIRROR_OF_ILLUSION:
      return mirrorOfIllusionImg;
  }
  return undefined;
};
