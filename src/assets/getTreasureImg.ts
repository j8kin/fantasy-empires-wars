import { TreasureName } from '../types/Treasures';
import type { EmpireTreasure, TreasureType } from '../types/Treasures';

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

const treasureImg: Partial<Record<TreasureType, string>> = {
  // items
  [TreasureName.WAND_OF_TURN_UNDEAD]: wandOfTurnUndeadImg,
  [TreasureName.ORB_OF_STORM]: orbOfStormImg,
  [TreasureName.SEED_OF_RENEWAL]: seedOfRenewalImg,
  [TreasureName.AEGIS_SHARD]: aegisShardImg,
  [TreasureName.RESURRECTION]: phoenixFeatherImg,
  [TreasureName.GLYPH_OF_SEVERANCE]: glyphOfSeveranceImg,
  [TreasureName.COMPASS_OF_DOMINION]: compassOfDominionImg,
  [TreasureName.DEED_OF_RECLAMATION]: deedOfReclamationImg,
  [TreasureName.MERCY_OF_ORRIVANE]: mercyOfOrrivaneImg,
  [TreasureName.HOURGLASS_OF_DELAY]: hourglassOfDelayImg,
  // relics
  [TreasureName.MIRROR_OF_ILLUSION]: mirrorOfIllusionImg,
  [TreasureName.BANNER_OF_UNITY]: bannerOfUnityImg,
  [TreasureName.HEARTSTONE_OF_ORRIVANE]: heartstoneOfOrrivaneImg,
  [TreasureName.SHARD_OF_THE_SILENT_ANVIL]: shardOfTheSilentAnvilImg,
  [TreasureName.CROWN_OF_DOMINION]: crownOfDominionImg,
  [TreasureName.SCEPTER_OF_TEMPESTS]: scepterOfTempestsImg,
  [TreasureName.OBSIDIAN_CHALICE]: obsidianChaliceImg,
  [TreasureName.VERDANT_IDOL]: verdantIdolImg,
  [TreasureName.STARWELL_PRISM]: starwellPrismImg,
};

export const getTreasureImg = (treasure: EmpireTreasure) => {
  return treasureImg[treasure.treasure.type];
};
