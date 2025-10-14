import { Spell, SpellName } from '../types/Spell';

import blessingImg from './spells/white/blessing.png';
import healImg from './spells/white/heal.png';
import turnImg from './spells/white/turn-undead.png';
import viewImg from './spells/white/view.png';
import illusionImg from './spells/blue/illusion.png';
import teleportImg from './spells/blue/teleport.png';
import tornadoImg from './spells/blue/tornado.png';
import fertileLandsImg from './spells/green/fertile-lands.png';
import rootsImg from './spells/green/roots.png';

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
      return rootsImg;
    default:
      return undefined;
  }
};
