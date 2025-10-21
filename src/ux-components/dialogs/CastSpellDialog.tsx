import React, { useCallback, useEffect } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage from '../fantasy-book-dialog-template/FlipBookPage';
import { AllSpells } from '../../types/Spell';
import { getSpellImg } from '../../assets/getSpellImg';
import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../types/GameState';

const CastSpellDialog: React.FC = () => {
  const { showCastSpellDialog, setShowCastSpellDialog, selectedLandAction } =
    useApplicationContext();
  const { gameState } = useGameContext();

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

  const selectedPlayer = getTurnOwner(gameState);
  const playerMana = selectedPlayer?.mana;

  // todo it should be possible to cast turn undead only once per turn
  const availableSpells = playerMana
    ? AllSpells.filter((spell) => spell.manaCost <= playerMana[spell.school])
    : [];

  return (
    <FlipBook onClickOutside={handleClose}>
      {availableSpells.map((spell, index) => (
        <FlipBookPage
          key={spell.id}
          pageNum={index}
          header={spell.id}
          iconPath={getSpellImg(spell)}
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
