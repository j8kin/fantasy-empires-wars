import { EmpireTreasure, TreasureType } from '../types/Treasures';

import orbOfStormImg from './treasures/orb-of-storm.png';
import wandOfTurnUndeadImg from './treasures/turn-undead.png';
import phoenixFeatherImg from './treasures/phoenix-feather.png';

import mirrorOfIllusionImg from './treasures/mirror-of-illusion.png';
import bannerOfUnityImg from './treasures/banner-of-unity.png';
import crownOfDominionImg from './treasures/crown-of-dominion.png';
import shardOfTheSilentAnvil from './treasures/shard-of-silent-avil.png'

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
    case TreasureType.BANNER_OF_UNITY:
      return bannerOfUnityImg;
    case TreasureType.CROWN_OF_DOMINION:
      return crownOfDominionImg;
    case TreasureType.SHARD_OF_THE_SILENT_ANVIL:
      return shardOfTheSilentAnvil;
  }
  return undefined;
};
