import type { UnitType } from '../types/UnitType';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../types/UnitType';

import wardHandsImg from './army/ward-hands.png';
import warriorImg from './army/warrior.png';
import nullwardenImg from './army/nullwarden.png';
import dwarfImg from './army/dwarf.png';
import halflingImg from './army/halflings.png';
import elfImg from './army/elf.png';
import darkElfImg from './army/dark-elf.png';
import orcImg from './army/orc.png';
import undeadImg from './army/undead.png';

import ballistaImg from './army/ballista.png';
import catapultImg from './army/catapult.png';
import batteringRamImg from './army/battering-ram.png';
import siegeTowerImg from './army/siege-tower.png';

import warsmithImg from './army/warsmith.png';
import zealotImg from './army/zealot.png';
import fighterImg from './army/fighter.png';
import hummerLordImg from './army/hummerlord.png';
import rangerImg from './army/ranger.png';
import shadowBladeImg from './army/shadowblade.png';
import ogrImg from './army/ogr.png';
import clericImg from './army/cleric.png';
import druidImg from './army/druid.png';
import enchanterImg from './army/enchanter.png';
import pyromancerImg from './army/pyromancer.png';
import necromancerImg from './army/necromancer.png';

const unitImg: Record<UnitType, string | undefined> = {
  [RegularUnitName.WARD_HANDS]: wardHandsImg,
  [RegularUnitName.WARRIOR]: warriorImg,
  [RegularUnitName.NULLWARDEN]: nullwardenImg,
  [RegularUnitName.DWARF]: dwarfImg,
  [RegularUnitName.HALFLING]: halflingImg,
  [RegularUnitName.ELF]: elfImg,
  [RegularUnitName.DARK_ELF]: darkElfImg,
  [RegularUnitName.UNDEAD]: undeadImg,
  [RegularUnitName.ORC]: orcImg,

  [WarMachineName.BALLISTA]: ballistaImg,
  [WarMachineName.CATAPULT]: catapultImg,
  [WarMachineName.BATTERING_RAM]: batteringRamImg,
  [WarMachineName.SIEGE_TOWER]: siegeTowerImg,

  [HeroUnitName.WARSMITH]: warsmithImg,
  [HeroUnitName.ZEALOT]: zealotImg,
  [HeroUnitName.FIGHTER]: fighterImg,
  [HeroUnitName.HAMMER_LORD]: hummerLordImg,
  [HeroUnitName.RANGER]: rangerImg,
  [HeroUnitName.SHADOW_BLADE]: shadowBladeImg,
  [HeroUnitName.OGR]: ogrImg,

  [HeroUnitName.CLERIC]: clericImg,
  [HeroUnitName.DRUID]: druidImg,
  [HeroUnitName.ENCHANTER]: enchanterImg,
  [HeroUnitName.PYROMANCER]: pyromancerImg,
  [HeroUnitName.NECROMANCER]: necromancerImg,
};

export const getUnitImg = (unit: UnitType) => {
  return unitImg[unit];
};
