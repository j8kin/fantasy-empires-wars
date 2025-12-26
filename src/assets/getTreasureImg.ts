import type { EmpireTreasure } from '../types/Treasures';
import { TreasureName } from '../types/Treasures';

import wandOfTurnUndeadImg from './treasures/turn-undead.png';
import orbOfStormImg from './treasures/orb-of-storm.png';
import seedOfRenewalImg from './treasures/seed-of-renewal.png';
import aegisShardImg from './treasures/aegis-shard.png';
import phoenixFeatherImg from './treasures/phoenix-feather.png';
import glyphOfSeveranceImg from './treasures/glyph-of-severance.png';
import compassOfDominionImg from './treasures/compass-of-dominion.png';
import deedOfReclamationImg from './treasures/deed-of-reclamation.png';
import mercyOfOrrivaneImg from './treasures/mercy-of-orrivane.png';
import hourglassOfDelayImg from './treasures/hourglass-of-delay.png';

import mirrorOfIllusionImg from './treasures/mirror-of-illusion.png';
import bannerOfUnityImg from './treasures/banner-of-unity.png';
import heartstoneOfOrrivaneImg from './treasures/heartstone-of-orrivane.png';
import shardOfTheSilentAnvilImg from './treasures/shard-of-silent-avil.png';
import crownOfDominionImg from './treasures/crown-of-dominion.png';
import scepterOfTempestsImg from './treasures/scepter-of-tempests.png';
import obsidianChaliceImg from './treasures/obsidian-chalice.png';
import verdantIdolImg from './treasures/verdant-idol.png';
import starwellPrismImg from './treasures/starwell-prism.png';

export const getTreasureImg = (treasure: EmpireTreasure) => {
  switch (treasure.treasure.type) {
    case TreasureName.WAND_OF_TURN_UNDEAD:
      return wandOfTurnUndeadImg;
    case TreasureName.ORB_OF_STORM:
      return orbOfStormImg;
    case TreasureName.SEED_OF_RENEWAL:
      return seedOfRenewalImg;
    case TreasureName.AEGIS_SHARD:
      return aegisShardImg;
    case TreasureName.RESURRECTION:
      return phoenixFeatherImg;
    case TreasureName.GLYPH_OF_SEVERANCE:
      return glyphOfSeveranceImg;
    case TreasureName.COMPASS_OF_DOMINION:
      return compassOfDominionImg;
    case TreasureName.DEED_OF_RECLAMATION:
      return deedOfReclamationImg;
    case TreasureName.MERCY_OF_ORRIVANE:
      return mercyOfOrrivaneImg;
    case TreasureName.HOURGLASS_OF_DELAY:
      return hourglassOfDelayImg;

    case TreasureName.MIRROR_OF_ILLUSION:
      return mirrorOfIllusionImg;
    case TreasureName.BANNER_OF_UNITY:
      return bannerOfUnityImg;
    case TreasureName.HEARTSTONE_OF_ORRIVANE:
      return heartstoneOfOrrivaneImg;
    case TreasureName.SHARD_OF_THE_SILENT_ANVIL:
      return shardOfTheSilentAnvilImg;
    case TreasureName.CROWN_OF_DOMINION:
      return crownOfDominionImg;
    case TreasureName.SCEPTER_OF_TEMPESTS:
      return scepterOfTempestsImg;
    case TreasureName.OBSIDIAN_CHALICE:
      return obsidianChaliceImg;
    case TreasureName.VERDANT_IDOL:
      return verdantIdolImg;
    case TreasureName.STARWELL_PRISM:
      return starwellPrismImg;
  }
  return undefined;
};
