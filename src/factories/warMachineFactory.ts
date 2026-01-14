import { getRecruitInfo } from '../domain/unit/unitRepository';
import type { WarMachineType } from '../types/UnitType';
import type { WarMachineState } from '../state/army/WarMachineState';

export const warMachineFactory = (unitType: WarMachineType): WarMachineState => {
  return {
    type: Object.freeze(unitType),
    count: 1,
    durability: getRecruitInfo(unitType).durability!,
  };
};
