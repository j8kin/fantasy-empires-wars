import React, { useCallback } from 'react';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageTypeName } from '../fantasy-book-dialog-template/FlipBookPage';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner, hasActiveEffectByPlayer } from '../../selectors/playerSelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { getValidMagicLands } from '../../map/magic/getValidMagicLands';
import { getSpellImg } from '../../assets/getSpellImg';
import { SpellName } from '../../types/Spell';
import { AllSpells } from '../../domain/spell/spellsRepository';
import type { SpellType } from '../../types/Spell';

const CastSpellDialog: React.FC = () => {
  const {
    showCastSpellDialog,
    setShowCastSpellDialog,
    setSelectedLandAction,
    addGlowingTile,
    setIsArcaneExchangeMode,
  } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleClose = useCallback(() => {
    setShowCastSpellDialog(false);
  }, [setShowCastSpellDialog]);

  const handleDialogClose = useCallback(() => {
    setShowCastSpellDialog(false);
    // Reset exchange mode when dialog is explicitly closed
    setIsArcaneExchangeMode(false);
  }, [setShowCastSpellDialog, setIsArcaneExchangeMode]);

  const createSpellClickHandler = useCallback(
    (spellId: SpellType) => {
      return () => {
        setSelectedLandAction(`${FlipBookPageTypeName.SPELL}: ${spellId}`);
        const spell = getSpellById(spellId);

        // Handle Arcane Exchange spell differently - don't glow any lands, just enter exchange mode
        if (spellId === SpellName.EXCHANGE) {
          setIsArcaneExchangeMode(true);
        } else {
          // Add tiles to the glowing tiles set for visual highlighting for other spells
          getValidMagicLands(gameState!, spell.type).forEach((tileId) => {
            addGlowingTile(tileId);
          });
        }

        handleClose();
      };
    },
    [gameState, setSelectedLandAction, addGlowingTile, handleClose, setIsArcaneExchangeMode]
  );

  if (!showCastSpellDialog || gameState == null) return null;

  const turnOwner = getTurnOwner(gameState);
  const playerMana = turnOwner.mana;

  const turnUndeadSpellCastAvailable =
    turnOwner.mana.white > 0 &&
    gameState.players.some((p) => p.id !== gameState.turnOwner && !hasActiveEffectByPlayer(p, SpellName.TURN_UNDEAD));

  const availableSpells = playerMana
    ? AllSpells.filter(
        (spell) =>
          spell.manaCost <= playerMana[spell.manaType] &&
          (spell.type !== SpellName.TURN_UNDEAD || turnUndeadSpellCastAvailable)
      )
    : [];

  return availableSpells.length > 0 ? (
    <FlipBook onClickOutside={handleDialogClose}>
      {availableSpells.map((spell, index) => (
        <FlipBookPage
          key={spell.type}
          pageNum={index}
          lorePage={1027}
          header={spell.type}
          iconPath={getSpellImg(spell)}
          description={spell.description}
          cost={spell.manaCost}
          costLabel="Mana Cost"
          onClose={handleDialogClose}
          onIconClick={createSpellClickHandler(spell.type)}
        />
      ))}
    </FlipBook>
  ) : null;
};

export default CastSpellDialog;
