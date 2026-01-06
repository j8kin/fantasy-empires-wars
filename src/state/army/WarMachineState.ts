import { WarMachineType } from '../../types/UnitType';

export interface WarMachineState {
  type: WarMachineType;
  count: number;
  /** how much battles it could survive before destruction **/
  durability: number;
}
