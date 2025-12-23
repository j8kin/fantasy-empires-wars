import type { UnitType } from '../types/UnitType';
import { HeroUnitName, RegularUnitName } from '../types/UnitType';

import wardHandsImg from './army/ward-hands.png';
import warriorImg from './army/warrior.png';
import dwarfImg from './army/dwarf.png';
import halflingImg from './army/halflings.png';
import elfImg from './army/elf.png';
import darkElfImg from './army/dark-elf.png';
import orcImg from './army/orc.png';
import undeadImg from './army/undead.png';
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
    case RegularUnitName.WARD_HANDS:
      return wardHandsImg;
    case RegularUnitName.WARRIOR:
      return warriorImg;
    case RegularUnitName.DWARF:
      return dwarfImg;
    case RegularUnitName.HALFLING:
      return halflingImg;
    case RegularUnitName.ELF:
      return elfImg;
    case RegularUnitName.DARK_ELF:
      return darkElfImg;
    case RegularUnitName.UNDEAD:
      return undeadImg;
    case RegularUnitName.ORC:
      return orcImg;
    case RegularUnitName.BALLISTA:
      return ballistaImg;
    case RegularUnitName.CATAPULT:
      return catapultImg;

    case HeroUnitName.WARSMITH:
      return warsmithImg;
    case HeroUnitName.FIGHTER:
      return fightableImg;
    case HeroUnitName.HAMMER_LORD:
      return hummerLordImg;
    case HeroUnitName.RANGER:
      return rangerImg;
    case HeroUnitName.SHADOW_BLADE:
      return shadowBladeImg;
    case HeroUnitName.OGR:
      return ogrImg;

    case HeroUnitName.CLERIC:
      return clericImg;
    case HeroUnitName.DRUID:
      return druidImg;
    case HeroUnitName.ENCHANTER:
      return enchanterImg;
    case HeroUnitName.PYROMANCER:
      return pyromancerImg;
    case HeroUnitName.NECROMANCER:
      return necromancerImg;

    default:
      return undefined;
  }
};
