import { Movements } from './Movements';
import { Unit } from './RegularUnit';

export type Army = {
  units: Unit[];
  controlledBy: string;
  movements?: Movements;
};

export type Armies = Army[];
