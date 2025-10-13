import React, { useCallback, useEffect } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage from '../fantasy-book-dialog-template/FlipBookPage';
import { AllSpells, Spell, SpellName } from '../../types/Spell';

import blessingImg from '../../assets/spells/white/blessing.png';
import healImg from '../../assets/spells/white/heal.png';
import turnImg from '../../assets/spells/white/turn-undead.png';
import viewImg from '../../assets/spells/white/view.png';
import illusionImg from '../../assets/spells/blue/illusion.png';
import teleportImg from '../../assets/spells/blue/teleport.png';
import tornadoImg from '../../assets/spells/blue/tornado.png';
import fertileLandsImg from '../../assets/spells/green/fertile-lands.png';
import rootsImg from '../../assets/spells/green/roots.png';

const getSpellIcon = (spell: Spell) => {
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

const CastSpellDialog: React.FC = () => {
  const { showCastSpellDialog, setShowCastSpellDialog, selectedLandAction } =
    useApplicationContext();

  const handleClose = useCallback(() => {
    setShowCastSpellDialog(false);
  }, [setShowCastSpellDialog]);

  useEffect(() => {
    if (selectedLandAction && showCastSpellDialog) {
      const spell = AllSpells.find((s) => s.id === selectedLandAction);
      if (spell) {
        setTimeout(() => {
          alert(
            `Casting ${spell.id}!\n\nMana Cost: ${spell.manaCost}\n\nEffect: ${spell.description}`
          );
          handleClose();
        }, 100);
      }
    }
  }, [selectedLandAction, showCastSpellDialog, handleClose]);

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
