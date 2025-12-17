import type { PlayerColorName } from '../../types/PlayerColors';
import type { Mana } from '../../types/Mana';
import type { HeroQuest } from '../../types/Quest';
import type { EmpireTreasure } from '../../types/Treasures';
import type { Diplomacy } from '../../types/Diplomacy';
import type { Effect } from '../../types/Effect';
import type { PlayerProfile } from './PlayerProfile';
import type { PlayerType } from './PlayerType';

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
