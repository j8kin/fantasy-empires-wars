import { EmpireTreasure, TreasureType } from '../types/Treasures';

import orbOfStormImg from './treasures/orb-of-storm.png';
import wandOfTurnUndeadImg from './treasures/turn-undead.png';
import phoenixFeatherImg from './treasures/phoenix-feather.png';
import aegisShardImg from './treasures/aegis-shard.png';
import compassOfDominionImg from './treasures/compass-of-dominion.png';
import deedOfReclamationImg from './treasures/deed-of-reclamation.png';
import seedOfRenewalImg from './treasures/seed-of-renewal.png';
import hourglassOfDelayImg from './treasures/hourglass-of-delay.png';

import mirrorOfIllusionImg from './treasures/mirror-of-illusion.png';
import bannerOfUnityImg from './treasures/banner-of-unity.png';
import crownOfDominionImg from './treasures/crown-of-dominion.png';
import scepterOfTempestsImg from './treasures/scepter-of-tempests.png';
import shardOfTheSilentAnvil from './treasures/shard-of-silent-avil.png';
import verdantIdolImg from './treasures/verdant-idol.png';
import heartstoneOfOrrivaneImg from './treasures/heartstone-of-orrivane.png';
import obsidianChaliceImg from './treasures/obsidian-chalice.png';
import starwellPrismImg from './treasures/starwell-prism.png';

export const getTreasureImg = (treasure: EmpireTreasure) => {
  switch (treasure.treasure.type) {
    case TreasureType.WAND_OF_TURN_UNDEAD:
      return wandOfTurnUndeadImg;
    case TreasureType.ORB_OF_STORM:
      return orbOfStormImg;
    case TreasureType.AEGIS_SHARD:
      return aegisShardImg;
    case TreasureType.COMPASS_OF_DOMINION:
      return compassOfDominionImg;
    case TreasureType.DEED_OF_RECLAMATION:
      return deedOfReclamationImg;
    case TreasureType.HOURGLASS_OF_DELAY:
      return hourglassOfDelayImg;
    case TreasureType.STONE_OF_RENEWAL:
      return seedOfRenewalImg;
    case TreasureType.RESURRECTION:
      return phoenixFeatherImg;
    case TreasureType.MIRROR_OF_ILLUSION:
      return mirrorOfIllusionImg;
    case TreasureType.BANNER_OF_UNITY:
      return bannerOfUnityImg;
    case TreasureType.CROWN_OF_DOMINION:
      return crownOfDominionImg;
    case TreasureType.SCEPTER_OF_TEMPESTS:
      return scepterOfTempestsImg;
    case TreasureType.SHARD_OF_THE_SILENT_ANVIL:
      return shardOfTheSilentAnvil;
    case TreasureType.HEARTSTONE_OF_ORRIVANE:
      return heartstoneOfOrrivaneImg;
    case TreasureType.VERDANT_IDOL:
      return verdantIdolImg;
    case TreasureType.OBSIDIAN_CHALICE:
      return obsidianChaliceImg;
    case TreasureType.STARWELL_PRISM:
      return starwellPrismImg;
  }
  return undefined;
};
