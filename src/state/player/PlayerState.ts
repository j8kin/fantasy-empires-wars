import { PlayerColorName } from '../../types/PlayerColors';
import { Mana } from '../../types/Mana';
import { HeroQuest } from '../../types/Quest';
import { EmpireTreasure } from '../../types/Treasures';
import { Diplomacy } from '../../types/Diplomacy';
import { PlayerProfile } from './PlayerProfile';
import { PlayerType } from './PlayerType';

export interface PlayerState {
  id: string; // todo UUUID
  playerType: PlayerType;
  playerProfile: PlayerProfile;

  mana: Mana;
  vault: number;

  diplomacy: Diplomacy;
  empireTreasures: EmpireTreasure[];
  quests: HeroQuest[];
  color: PlayerColorName;

  landsOwned: Set<string>;
}
