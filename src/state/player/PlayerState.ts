import type { PlayerColorName } from '../../types/PlayerColors';
import type { ManaType } from '../../types/Mana';
import type { HeroQuest } from '../../types/Quest';
import type { EmpireTreasure } from '../../types/Treasures';
import type { DiplomacyStatusType } from '../../types/Diplomacy';
import type { Effect } from '../../types/Effect';
import type { PlayerProfile, PlayerType } from './PlayerProfile';

export interface PlayerState {
  id: string; // todo UUUID
  playerType: PlayerType;
  playerProfile: PlayerProfile;
  color: PlayerColorName;

  mana: Record<ManaType, number>;
  effects: Effect[];

  vault: number;

  diplomacy: Record<string, DiplomacyStatusType>;
  empireTreasures: EmpireTreasure[];
  quests: HeroQuest[];

  landsOwned: Set<string>;
}
