import { ManaType } from './Mana';
import blessingImg from '../assets/spells/white/blessing.png';
import healImg from '../assets/spells/white/heal.png';
import turnImg from '../assets/spells/white/turn-undead.png';
import viewImg from '../assets/spells/white/view.png';

// https://github.com/j8kin/fantasy-empires-wars/wiki/Magic

export interface Spell {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  iconPath?: string;
  school: ManaType;
}

export const WhiteMagicSpells: Spell[] = [
  {
    id: 'turn_undead',
    name: 'Turn Undead',
    description: 'Turns undead on the selected land',
    manaCost: 0,
    iconPath: blessingImg,
    school: ManaType.WHITE,
  },
  {
    id: 'view_territory',
    name: 'View Territory',
    description: "Reveals information about an opponent's territory",
    manaCost: 25,
    iconPath: viewImg,
    school: ManaType.WHITE,
  },
  {
    id: 'blessing_of_protection',
    name: 'Blessing of Protection',
    description: 'Increases defense of all units on a territory for 2 turns (+20%)',
    manaCost: 40,
    iconPath: turnImg,
    school: ManaType.WHITE,
  },
  {
    id: 'heal_wounded',
    name: 'Heal Wounded',
    description: 'Restores 20–30% of lost units after battle (cannot resurrect heroes)',
    manaCost: 60,
    iconPath: healImg,
    school: ManaType.WHITE,
  },
];
