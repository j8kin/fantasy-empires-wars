import React, { useCallback, useEffect } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageType } from '../fantasy-book-dialog-template/FlipBookPage';

import { AllSpells, getSpellById, SpellName } from '../../types/Spell';
import { getTurnOwner } from '../../types/GameState';
import { getAvailableToCastSpellLands } from '../../map/magic/getAvailableToCastSpellLands';

import { getSpellImg } from '../../assets/getSpellImg';

const CastSpellDialog: React.FC = () => {
  const {
    showCastSpellDialog,
    setShowCastSpellDialog,
    selectedLandAction,
    setSelectedLandAction,
    addGlowingTile,
  } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleClose = useCallback(() => {
    setShowCastSpellDialog(false);
  }, [setShowCastSpellDialog]);

  const createSpellClickHandler = useCallback(
    (spellId: SpellName) => {
      return () => {
        setSelectedLandAction(`${FlipBookPageType.SPELL}: ${spellId}`);
        const spell = getSpellById(spellId);

        // Add tiles to the glowing tiles set for visual highlighting
        getAvailableToCastSpellLands(gameState!, spell.id).forEach((tileId) => {
          addGlowingTile(tileId);
        });

        handleClose();
      };
    },
    [gameState, setSelectedLandAction, addGlowingTile, handleClose]
  );

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
    ? AllSpells.filter(
        (spell) =>
          spell.manaCost <= playerMana[spell.manaType] &&
          (spell.id !== SpellName.TURN_UNDEAD || selectedPlayer?.mana.white > 0)
      )
    : [];

  return (
    <FlipBook onClickOutside={handleClose}>
      {availableSpells.map((spell, index) => (
        <FlipBookPage
          key={spell.id}
          pageNum={index}
          lorePage={1027}
          header={spell.id}
          iconPath={getSpellImg(spell)}
          description={spell.description}
          cost={spell.manaCost}
          costLabel="Mana Cost"
          onClose={handleClose}
          onIconClick={createSpellClickHandler(spell.id as SpellName)}
        />
      ))}
    </FlipBook>
  );
};

export default CastSpellDialog;
