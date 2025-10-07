import { ManaType } from './Mana';

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
    description:
      'Turns undead on the selected land. The number of undead affected depends on the maximum Cleric level',
    manaCost: 0,
    school: ManaType.WHITE,
  },
  {
    id: 'view_territory',
    name: 'View Territory',
    description:
      "Reveals information about an opponent's territory (units including heroes, buildings, and troop movements this turn)",
    manaCost: 25,
    school: ManaType.WHITE,
  },
  {
    id: 'blessing_of_protection',
    name: 'Blessing of Protection',
    description: 'Increases defense of all units on a territory for 2 turns (+20%)',
    manaCost: 40,
    school: ManaType.WHITE,
  },
  {
    id: 'heal_wounded',
    name: 'Heal Wounded',
    description: 'Restores 20–30% of lost units after battle (cannot resurrect heroes)',
    manaCost: 60,
    school: ManaType.WHITE,
  },
];
