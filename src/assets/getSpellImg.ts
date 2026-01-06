import { SpellName } from '../types/Spell';
import { Mana } from '../types/Mana';
import type { ManaType } from '../types/Mana';
import type { Spell, SpellType } from '../types/Spell';

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

const spellImg: Record<SpellType, string> = {
  // white spells
  [SpellName.BLESSING]: blessingImg,
  [SpellName.HEAL]: healImg,
  [SpellName.TURN_UNDEAD]: turnImg,
  [SpellName.VIEW_TERRITORY]: viewImg,
  // green spells
  [SpellName.FERTILE_LAND]: fertileLandsImg,
  [SpellName.ENTANGLING_ROOTS]: entangledRootsImg,
  [SpellName.BEAST_ATTACK]: beastAttachImg,
  [SpellName.EARTHQUAKE]: earthquakeImg,
  // blue spells
  [SpellName.ILLUSION]: illusionImg,
  [SpellName.TELEPORT]: teleportImg,
  [SpellName.TORNADO]: tornadoImg,
  [SpellName.EXCHANGE]: arcaneExchangeImg,
  // red spells
  [SpellName.EMBER_RAID]: emberRaidImg,
  [SpellName.FORGE_OF_WAR]: forgeOfWarImg,
  [SpellName.FIRESTORM]: fireStormImg,
  [SpellName.METEOR_SHOWER]: meteorShowerImg,
  // black spells
  [SpellName.SUMMON_UNDEAD]: summonUndeadImg,
  [SpellName.RAISE_DEAD_HERO]: raiseDeadHeroImg,
  [SpellName.PLAGUE]: plagueImg,
  [SpellName.CORRUPTION]: corruptionImg,
};

const animationImg: Record<ManaType, string> = {
  [Mana.WHITE]: whiteEndAnimationImg,
  [Mana.GREEN]: greenEndAnimationImg,
  [Mana.BLUE]: blueEndAnimationImg,
  [Mana.RED]: redEndAnimationImg,
  [Mana.BLACK]: blackEndAnimationImg,
};

export const getSpellImg = (spell: Spell) => {
  return spellImg[spell.type];
};

export const getSpellEndAnimationImg = (manaType: ManaType) => {
  return animationImg[manaType];
};
