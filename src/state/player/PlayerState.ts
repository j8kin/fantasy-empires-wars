import { PlayerColorName } from '../../types/PlayerColors';
import { Mana } from '../../types/Mana';
import { HeroQuest } from '../../types/Quest';
import { EmpireTreasure } from '../../types/Treasures';
import { Diplomacy } from '../../types/Diplomacy';
import { Effect } from '../../types/Effect';
import { PlayerProfile } from './PlayerProfile';
import { PlayerType } from './PlayerType';

export interface PlayerState {
  id: string; // todo UUUID
  playerType: PlayerType;
  playerProfile: PlayerProfile;
  color: PlayerColorName;

  mana: Mana;
  effects: Effect[];

  vault: number;

  diplomacy: Diplomacy;
  empireTreasures: EmpireTreasure[];
  quests: HeroQuest[];

  landsOwned: Set<string>;
}
