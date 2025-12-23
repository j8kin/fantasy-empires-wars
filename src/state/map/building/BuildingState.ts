import type { BuildingType, RecruitmentSlot } from '../../../types/Building';

export interface BuildingState {
  type: BuildingType;
  slots: RecruitmentSlot[];
}
