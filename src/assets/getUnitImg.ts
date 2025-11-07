import { HeroUnitType, RegularUnitType, UnitType } from '../types/Army';

import warriorImg from './army/warrior.png';
import dwarfImg from './army/dwarf.png';
import elfImg from './army/elf.png';
import darkElfImg from './army/dark-elf.png';
import orcImg from './army/orc.png';
import ballistaImg from './army/ballista.png';
import catapultImg from './army/catapult.png';

import fightableImg from './army/fighter.png';
import hummerLordImg from './army/hummerlord.png';
import rangerImg from './army/ranger.png';

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
    case RegularUnitType.BALLISTA:
      return ballistaImg;
    case RegularUnitType.CATAPULT:
      return catapultImg;

    case HeroUnitType.FIGHTER:
      return fightableImg;
    case HeroUnitType.HAMMER_LORD:
      return hummerLordImg;
    case HeroUnitType.RANGER:
      return rangerImg;

    default:
      return undefined;
  }
};
