import type { BuildingType } from '../../../types/Building';
import type { UnitType } from '../../../types/UnitType';

export interface RecruitmentSlot {
  isOccupied: boolean;
  unit: UnitType;
  turnsRemaining: number;
}

export interface BuildingState {
  /** UUID **/
  readonly id: string;
  readonly type: BuildingType;
  readonly slots: RecruitmentSlot[];
}
