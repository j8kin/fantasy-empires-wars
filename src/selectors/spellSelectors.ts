import type { Spell, SpellType } from '../types/Spell';
import type { ManaType } from '../types/Mana';
import { AllSpells } from '../domain/spell/spellsRepository';

export const getSpellById = (id: SpellType): Spell => AllSpells.find((spell) => spell.id === id)!;

export const getMinManaCost = (mana: ManaType): number => {
  // Filter spells by mana type and find minimum cost
  const spellsOfType = AllSpells.filter((spell) => spell.manaType === mana);
  if (spellsOfType.length === 0) return 5;

  return Math.max(5, Math.min(...spellsOfType.map((spell) => spell.manaCost)));
};
