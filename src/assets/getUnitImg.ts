import { RegularUnitType, UnitType } from '../types/Army';

import warriorImg from './army/warrior.png';
import dwarfImg from './army/dwarf.png';
import elfImg from './army/elf.png';
import darkElfImg from './army/dark-elf.png';
import orcImg from './army/orc.png';

export const getUnitImg = (unit: UnitType) => {
  switch (unit) {
    case RegularUnitType.WARRIOR:
      return warriorImg;
    case RegularUnitType.DWARF:
      return dwarfImg;
    case RegularUnitType.ELF:
      return elfImg;
    case RegularUnitType.DARK_ELF:
      return darkElfImg;
    case RegularUnitType.ORC:
      return orcImg;
    default:
      return undefined;
  }
};
