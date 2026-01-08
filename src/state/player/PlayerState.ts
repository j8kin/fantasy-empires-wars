import type { PlayerProfile, PlayerType } from './PlayerProfile';
import type { PlayerColorName } from '../../types/PlayerColors';
import type { HeroQuest } from '../../types/Quest';
import type { EmpireTreasure } from '../../types/Treasures';
import type { Effect } from '../../types/Effect';
import type { DiplomacyStatusType } from '../../types/Diplomacy';
import type { ManaType } from '../../types/Mana';
import type { LandType } from '../../types/Land';
import type { UnitType } from '../../types/UnitType';

export interface PlayerTraits {
  restrictedMagic: Set<ManaType>;
  recruitedUnitsPerLand: Record<LandType, Set<UnitType>>;
}

export interface PlayerState {
  id: string; // todo UUUID
  playerType: PlayerType;
  playerProfile: PlayerProfile;
  color: PlayerColorName;
  traits: PlayerTraits;

  mana: Record<ManaType, number>;
  effects: Effect[];

  vault: number;

  diplomacy: Record<string, DiplomacyStatusType>;
  empireTreasures: EmpireTreasure[];
  quests: HeroQuest[];

  landsOwned: Set<string>;
}
