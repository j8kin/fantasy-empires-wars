import { WarMachineType } from '../types/UnitType';
import { WarMachineState } from '../state/army/WarMachineState';

export const warMachineFactory = (unitType: WarMachineType): WarMachineState => {
  return {
    type: Object.freeze(unitType),
    count: 1,
  };
};
