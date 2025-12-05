import React, { useCallback, useEffect } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getSpellById } from '../../selectors/spellSelectors';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageType } from '../fantasy-book-dialog-template/FlipBookPage';

import { AllSpells, SpellName } from '../../types/Spell';
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

  if (!showCastSpellDialog || gameState == null) return null;

  const turnOwner = getTurnOwner(gameState);
  const playerMana = turnOwner.mana;

  const turnUndeadSpellCastAvailable =
    turnOwner.mana.white > 0 &&
    gameState.players.some(
      (p) =>
        p.id !== gameState.turnOwner && !p.effects.some((e) => e.spell === SpellName.TURN_UNDEAD)
    );

  const availableSpells = playerMana
    ? AllSpells.filter(
        (spell) =>
          spell.manaCost <= playerMana[spell.manaType] &&
          (spell.id !== SpellName.TURN_UNDEAD || turnUndeadSpellCastAvailable)
      )
    : [];

  return availableSpells.length > 0 ? (
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
  ) : null;
};

export default CastSpellDialog;
