import { HeroUnitType, RegularUnitType, UnitType } from '../types/UnitType';

import wardHandsImg from './army/ward-hands.png';
import warriorImg from './army/warrior.png';
import dwarfImg from './army/dwarf.png';
import halflingImg from './army/halflings.png';
import elfImg from './army/elf.png';
import darkElfImg from './army/dark-elf.png';
import orcImg from './army/orc.png';
import ballistaImg from './army/ballista.png';
import catapultImg from './army/catapult.png';

import warsmithImg from './army/warsmith.png';
import fightableImg from './army/fighter.png';
import hummerLordImg from './army/hummerlord.png';
import rangerImg from './army/ranger.png';
import shadowBladeImg from './army/shadowblade.png';
import ogrImg from './army/ogr.png';
import clericImg from './army/cleric.png';
import druidImg from './army/druid.png';
import enchanterImg from './army/enchanter.png';
import pyromancerImg from './army/pyromancer.png';
import necromancerImg from './army/necromancer.png';

export const getUnitImg = (unit: UnitType) => {
  switch (unit) {
    case RegularUnitType.WARD_HANDS:
      return wardHandsImg;
    case RegularUnitType.WARRIOR:
      return warriorImg;
    case RegularUnitType.DWARF:
      return dwarfImg;
    case RegularUnitType.HALFLING:
      return halflingImg;
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

    case HeroUnitType.WARSMITH:
      return warsmithImg;
    case HeroUnitType.FIGHTER:
      return fightableImg;
    case HeroUnitType.HAMMER_LORD:
      return hummerLordImg;
    case HeroUnitType.RANGER:
      return rangerImg;
    case HeroUnitType.SHADOW_BLADE:
      return shadowBladeImg;
    case HeroUnitType.OGR:
      return ogrImg;

    case HeroUnitType.CLERIC:
      return clericImg;
    case HeroUnitType.DRUID:
      return druidImg;
    case HeroUnitType.ENCHANTER:
      return enchanterImg;
    case HeroUnitType.PYROMANCER:
      return pyromancerImg;
    case HeroUnitType.NECROMANCER:
      return necromancerImg;

    default:
      return undefined;
  }
};
