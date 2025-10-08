import React, { useCallback, useEffect } from 'react';
import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage from '../fantasy-book-dialog-template/FlipBookPage';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { AllSpells, Spell, SpellName } from '../../types/Spell';

import blessingImg from '../../assets/spells/white/blessing.png';
import healImg from '../../assets/spells/white/heal.png';
import turnImg from '../../assets/spells/white/turn-undead.png';
import viewImg from '../../assets/spells/white/view.png';
import illusionImg from '../../assets/spells/blue/illusion.png';
import teleportImg from '../../assets/spells/blue/teleport.png';

const getSpellIcon = (spell: Spell) => {
  switch (spell.id) {
    case SpellName.BLESSING:
      return blessingImg;
    case SpellName.HEAL:
      return healImg;
    case SpellName.TURN_UNDEAD:
      return turnImg;
    case SpellName.VIEW_TERRITORY:
      return viewImg;
    case SpellName.ILLUSION:
      return illusionImg;
    case SpellName.TELEPORT:
      return teleportImg;
    default:
      return undefined;
  }
};

const CastSpellDialog: React.FC = () => {
  const { showCastSpellDialog, setShowCastSpellDialog, selectedItem, setSelectedItem } =
    useApplicationContext();

  const handleClose = useCallback(() => {
    setSelectedItem(null);
    setShowCastSpellDialog(false);
  }, [setSelectedItem, setShowCastSpellDialog]);

  useEffect(() => {
    if (selectedItem && showCastSpellDialog) {
      const spell = AllSpells.find((s) => s.id === selectedItem);
      if (spell) {
        setTimeout(() => {
          alert(
            `Casting ${spell.id}!\n\nMana Cost: ${spell.manaCost}\n\nEffect: ${spell.description}`
          );
          handleClose();
        }, 100);
      }
    }
  }, [selectedItem, showCastSpellDialog, handleClose]);

  if (!showCastSpellDialog) return null;

  return (
    <FlipBook onClickOutside={handleClose}>
      {AllSpells.map((spell, index) => (
        <FlipBookPage
          key={spell.id}
          pageNum={index}
          header={spell.id}
          iconPath={getSpellIcon(spell)}
          description={spell.description}
          cost={spell.manaCost}
          costLabel="Mana Cost"
          onClose={handleClose}
        />
      ))}
    </FlipBook>
  );
};

export default CastSpellDialog;
