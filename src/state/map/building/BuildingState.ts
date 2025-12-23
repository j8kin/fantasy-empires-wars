import type { BuildingType, RecruitmentSlot } from '../../../types/Building';

export interface BuildingState {
  /** UUID **/
  readonly id: string;
  readonly type: BuildingType;
  readonly slots: RecruitmentSlot[];
}
