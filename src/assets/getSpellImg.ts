import { Spell, SpellName } from '../types/Spell';
import { ManaType } from '../types/Mana';

import blessingImg from './spells/white/blessing.png';
import healImg from './spells/white/heal.png';
import turnImg from './spells/white/turn-undead.png';
import viewImg from './spells/white/view.png';
import illusionImg from './spells/blue/illusion.png';
import teleportImg from './spells/blue/teleport.png';
import tornadoImg from './spells/blue/tornado.png';
import arcaneExchangeImg from './spells/blue/arcane-exchange.png';
import fertileLandsImg from './spells/green/fertile-lands.png';
import entangledRootsImg from './spells/green/entangled-roots.png';
import beastAttachImg from './spells/green/beast-attack.png';
import earthquakeImg from './spells/green/earthquake.png';
import emberRaidImg from './spells/red/ember-raid.png';
import forgeOfWarImg from './spells/red/forge-of-war.png';
import fireStormImg from './spells/red/firestorm.png';
import meteorShowerImg from './spells/red/meteor-shower.png';
import summonUndeadImg from './spells/black/summon-undead.png';
import raiseDeadHeroImg from './spells/black/raise-dead-hero.png';
import plagueImg from './spells/black/plague.png';
import corruptionImg from './spells/black/corruption.png';

import whiteEndAnimationImg from './spells/_animation/white-end.png';
import blackEndAnimationImg from './spells/_animation/black-end.png';
import greenEndAnimationImg from './spells/_animation/green-end.png';
import redEndAnimationImg from './spells/_animation/red-end.png';
import blueEndAnimationImg from './spells/_animation/blue-end.png';

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
    case SpellName.EXCHANGE:
      return arcaneExchangeImg;
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
    case SpellName.METEOR_SHOWER:
      return meteorShowerImg;
    // black spells
    case SpellName.SUMMON_UNDEAD:
      return summonUndeadImg;
    case SpellName.RAISE_DEAD_HERO:
      return raiseDeadHeroImg;
    case SpellName.PLAGUE:
      return plagueImg;
    case SpellName.CORRUPTION:
      return corruptionImg;
  }
};

export const getSpellEndAnimationImg = (manaType: ManaType) => {
  switch (manaType) {
    case ManaType.WHITE:
      return whiteEndAnimationImg;
    case ManaType.BLACK:
      return blackEndAnimationImg;
    case ManaType.GREEN:
      return greenEndAnimationImg;
    case ManaType.RED:
      return redEndAnimationImg;
    case ManaType.BLUE:
      return blueEndAnimationImg;
  }
};
