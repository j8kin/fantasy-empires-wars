import { Alignment } from '../../types/Alignment';
import { HeroUnitType } from '../../types/UnitType';
import { PlayerColorName } from '../../types/PlayerColors';

import { PlayerRace } from './PlayerType';

export interface PlayerProfile {
  id: string;
  name: string;
  alignment: Alignment;
  race: PlayerRace;
  type: HeroUnitType;
  level: number; // up to MAX_HERO_LEVEL
  description: string;
  color: PlayerColorName; // base player color when game starts continues current color
}
