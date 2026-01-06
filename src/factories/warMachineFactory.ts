import { WarMachineName, WarMachineType } from '../types/UnitType';
import { WarMachineState } from '../state/army/WarMachineState';

const WAR_MACHINE_DURABILITY: Record<WarMachineType, number> = {
  [WarMachineName.CATAPULT]: 3,
  [WarMachineName.BALLISTA]: 5,
  [WarMachineName.SIEGE_TOWER]: 2,
  [WarMachineName.BATTERING_RAM]: 7,
};

export const warMachineFactory = (unitType: WarMachineType): WarMachineState => {
  return {
    type: Object.freeze(unitType),
    count: 1,
    durability: WAR_MACHINE_DURABILITY[unitType],
  };
};
