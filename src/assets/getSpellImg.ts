import { Spell, SpellName } from '../types/Spell';

import blessingImg from './spells/white/blessing.png';
import healImg from './spells/white/heal.png';
import turnImg from './spells/white/turn-undead.png';
import viewImg from './spells/white/view.png';
import illusionImg from './spells/blue/illusion.png';
import teleportImg from './spells/blue/teleport.png';
import tornadoImg from './spells/blue/tornado.png';
import fertileLandsImg from './spells/green/fertile-lands.png';
import entangledRootsImg from './spells/green/entangled-roots.png';
import beastAttachImg from './spells/green/beast-attack.png';
import earthquakeImg from './spells/green/earthquake.png';
import emberRaidImg from './spells/red/ember-raid.png';
import forgeOfWarImg from './spells/red/forge-of-war.png';
import fireStormImg from './spells/red/firestorm.png';

import summonUndeadImg from './spells/black/summon-undead.png';

export const getSpellImg = (spell: Spell) => {
  switch (spell.id) {
    // white spells
    case SpellName.BLESSING:
      return blessingImg;
    case SpellName.HEAL:
      return healImg;
    case SpellName.TURN_UNDEAD:
      return turnImg;
    case SpellName.VIEW_TERRITORY:
      return viewImg;
    // blue spells
    case SpellName.ILLUSION:
      return illusionImg;
    case SpellName.TELEPORT:
      return teleportImg;
    case SpellName.TORNADO:
      return tornadoImg;
    // green spells
    case SpellName.FERTILE_LAND:
      return fertileLandsImg;
    case SpellName.ENTANGLING_ROOTS:
      return entangledRootsImg;
    case SpellName.BEAST_ATTACK:
      return beastAttachImg;
    case SpellName.EARTHQUAKE:
      return earthquakeImg;
    // red spells
    case SpellName.EMBER_RAID:
      return emberRaidImg;
    case SpellName.FORGE_OF_WAR:
      return forgeOfWarImg;
    case SpellName.FIRESTORM:
      return fireStormImg;
    // black spells
    case SpellName.SUMMON_UNDEAD:
      return summonUndeadImg;
    default:
      return undefined;
  }
};
