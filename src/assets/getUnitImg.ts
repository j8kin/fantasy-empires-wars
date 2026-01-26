import { HeroUnitName, RegularUnitName, WarMachineName } from '../types/UnitType';
import { Doctrine } from '../state/player/PlayerProfile';
import type { UnitType } from '../types/UnitType';
import type { DoctrineType } from '../state/player/PlayerProfile';

import wardHandsImg from './army/ward-hands.png';
import warriorImg from './army/warrior.png';
import dwarfImg from './army/dwarf.png';
import halflingImg from './army/halflings.png';
import elfImg from './army/elf.png';
import darkElfImg from './army/dark-elf.png';
import orcImg from './army/orc.png';
import undeadImg from './army/undead.png';
// ANTI MAGIC
import nullwardenElfImg from './army/anti-magic/elf.png';
import nullwardenOrcImg from './army/anti-magic/orc.png';
import nullwardenWarriorImg from './army/anti-magic/warrior.png';
import nullwardenDwarfImg from './army/anti-magic/dwarf.png';
import nullwardenFighterImg from './army/anti-magic/fighter.png';
import nullwardenOgrImg from './army/anti-magic/ogr.png';
import nullwardenHammerLordImg from './army/anti-magic/hammer-lord.png';
import nullwardenRangerImg from './army/anti-magic/ranger.png';
// DRIVEN DOCTRINE
import golemImg from './army/driven/golem.png';
import gargoylesImg from './army/driven/gargoyle.png';
import dendriteImg from './army/driven/dendrite.png';

import ballistaImg from './army/ballista.png';
import catapultImg from './army/catapult.png';
import batteringRamImg from './army/battering-ram.png';
import siegeTowerImg from './army/siege-tower.png';

import warsmithImg from './army/warsmith.png';
import fighterImg from './army/fighter.png';
import hammerLordImg from './army/hammerlord.png';
import rangerImg from './army/ranger.png';
import shadowBladeImg from './army/shadowblade.png';
import ogrImg from './army/ogr.png';
import clericImg from './army/cleric.png';
import druidImg from './army/druid.png';
import enchanterImg from './army/enchanter.png';
import pyromancerImg from './army/pyromancer.png';
import necromancerImg from './army/necromancer.png';

const unitImg: Record<UnitType, string> = {
  [RegularUnitName.WARD_HANDS]: wardHandsImg,
  [RegularUnitName.WARRIOR]: warriorImg,
  [RegularUnitName.DWARF]: dwarfImg,
  [RegularUnitName.HALFLING]: halflingImg,
  [RegularUnitName.ELF]: elfImg,
  [RegularUnitName.DARK_ELF]: darkElfImg,
  [RegularUnitName.UNDEAD]: undeadImg,
  [RegularUnitName.ORC]: orcImg,

  // Driven Doctrine
  [RegularUnitName.GOLEM]: golemImg,
  [RegularUnitName.GARGOYLE]: gargoylesImg,
  [RegularUnitName.DENDRITE]: dendriteImg,

  [WarMachineName.BALLISTA]: ballistaImg,
  [WarMachineName.CATAPULT]: catapultImg,
  [WarMachineName.BATTERING_RAM]: batteringRamImg,
  [WarMachineName.SIEGE_TOWER]: siegeTowerImg,

  [HeroUnitName.WARSMITH]: warsmithImg,
  [HeroUnitName.FIGHTER]: fighterImg,
  [HeroUnitName.HAMMER_LORD]: hammerLordImg,
  [HeroUnitName.RANGER]: rangerImg,
  [HeroUnitName.SHADOW_BLADE]: shadowBladeImg,
  [HeroUnitName.OGR]: ogrImg,

  [HeroUnitName.CLERIC]: clericImg,
  [HeroUnitName.DRUID]: druidImg,
  [HeroUnitName.ENCHANTER]: enchanterImg,
  [HeroUnitName.PYROMANCER]: pyromancerImg,
  [HeroUnitName.NECROMANCER]: necromancerImg,
};

const nullwardenImgs: Record<UnitType, string> = {
  [RegularUnitName.WARRIOR]: nullwardenWarriorImg,
  [RegularUnitName.ELF]: nullwardenElfImg,
  [RegularUnitName.DARK_ELF]: nullwardenElfImg,
  [RegularUnitName.ORC]: nullwardenOrcImg,
  [RegularUnitName.DWARF]: nullwardenDwarfImg,

  [WarMachineName.BALLISTA]: ballistaImg,
  [WarMachineName.CATAPULT]: catapultImg,
  [WarMachineName.BATTERING_RAM]: batteringRamImg,
  [WarMachineName.SIEGE_TOWER]: siegeTowerImg,

  [HeroUnitName.FIGHTER]: nullwardenFighterImg,
  [HeroUnitName.OGR]: nullwardenOgrImg,
  [HeroUnitName.RANGER]: nullwardenRangerImg,
  [HeroUnitName.SHADOW_BLADE]: nullwardenRangerImg,
  [HeroUnitName.HAMMER_LORD]: nullwardenHammerLordImg,
};

export const getUnitImg = (unit: UnitType, doctrine: DoctrineType) => {
  if (doctrine === Doctrine.ANTI_MAGIC) {
    return nullwardenImgs[unit];
  }
  return unitImg[unit];
};
