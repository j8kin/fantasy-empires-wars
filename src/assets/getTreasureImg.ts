import type { EmpireTreasure } from '../types/Treasures';
import { TreasureName } from '../types/Treasures';

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
    case TreasureName.WAND_OF_TURN_UNDEAD:
      return wandOfTurnUndeadImg;
    case TreasureName.ORB_OF_STORM:
      return orbOfStormImg;
    case TreasureName.AEGIS_SHARD:
      return aegisShardImg;
    case TreasureName.COMPASS_OF_DOMINION:
      return compassOfDominionImg;
    case TreasureName.DEED_OF_RECLAMATION:
      return deedOfReclamationImg;
    case TreasureName.HOURGLASS_OF_DELAY:
      return hourglassOfDelayImg;
    case TreasureName.STONE_OF_RENEWAL:
      return seedOfRenewalImg;
    case TreasureName.RESURRECTION:
      return phoenixFeatherImg;
    case TreasureName.MIRROR_OF_ILLUSION:
      return mirrorOfIllusionImg;
    case TreasureName.BANNER_OF_UNITY:
      return bannerOfUnityImg;
    case TreasureName.CROWN_OF_DOMINION:
      return crownOfDominionImg;
    case TreasureName.SCEPTER_OF_TEMPESTS:
      return scepterOfTempestsImg;
    case TreasureName.SHARD_OF_THE_SILENT_ANVIL:
      return shardOfTheSilentAnvil;
    case TreasureName.HEARTSTONE_OF_ORRIVANE:
      return heartstoneOfOrrivaneImg;
    case TreasureName.VERDANT_IDOL:
      return verdantIdolImg;
    case TreasureName.OBSIDIAN_CHALICE:
      return obsidianChaliceImg;
    case TreasureName.STARWELL_PRISM:
      return starwellPrismImg;
  }
  return undefined;
};
