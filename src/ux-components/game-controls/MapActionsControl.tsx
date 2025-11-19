import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import GameButton from '../buttons/GameButton';
import { useGameContext } from '../../contexts/GameContext';
import { getAllBuildings } from '../../types/Building';
import { ButtonName } from '../../types/ButtonName';
import { AllSpells, SpellName } from '../../types/Spell';
import { getTurnOwner } from '../../types/GameState';

const MapActionsControl: React.FC = () => {
  const {
    setShowCastSpellDialog,
    setShowConstructBuildingDialog,
    setErrorMessagePopupMessage,
    setShowErrorMessagePopup,
  } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleShowCastSpellDialog = useCallback(() => {
    if (gameState == null) return;
    const selectedPlayer = getTurnOwner(gameState);
    if (!selectedPlayer) return;
    const playerMana = selectedPlayer.mana!;
    if (
      AllSpells.some(
        (spell) =>
          // turn undead could only be cast if related mana is available
          // todo it should be possible to cast turn undead only once per turn
          !(spell.id === SpellName.TURN_UNDEAD && playerMana[spell.manaType] === 0) &&
          spell.manaCost <= playerMana[spell.manaType]
      )
    ) {
      setShowCastSpellDialog(true);
    } else {
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        setErrorMessagePopupMessage('Not enough mana to cast Spells!');
        setShowErrorMessagePopup(true);
      }
    }
  }, [gameState, setErrorMessagePopupMessage, setShowCastSpellDialog, setShowErrorMessagePopup]);

  const handleShowConstructBuildingDialog = useCallback(() => {
    if (gameState == null) return;
    const selectedPlayer = getTurnOwner(gameState);
    if (!selectedPlayer) return;
    if (
      getAllBuildings(selectedPlayer).some(
        (building) => building.buildCost <= selectedPlayer.vault!
      )
    ) {
      setShowConstructBuildingDialog(true);
    } else {
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        setErrorMessagePopupMessage('Not enough money to construct a building!');
        setShowErrorMessagePopup(true);
      }
    }
  }, [
    gameState,
    setErrorMessagePopupMessage,
    setShowConstructBuildingDialog,
    setShowErrorMessagePopup,
  ]);

  if (getTurnOwner(gameState)?.playerType !== 'human') return null;

  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.BUILD} onClick={handleShowConstructBuildingDialog} />
      <GameButton buttonName={ButtonName.CAST} onClick={handleShowCastSpellDialog} />
      <GameButton buttonName={ButtonName.USE} />
    </div>
  );
};

export default MapActionsControl;
