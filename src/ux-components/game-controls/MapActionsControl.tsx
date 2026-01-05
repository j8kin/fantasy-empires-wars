import React, { Activity, useCallback } from 'react';
import styles from './css/GameControl.module.css';

import GameButton from '../buttons/GameButton';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import { getAllBuildings } from '../../domain/building/buildingRepository';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { AllSpells } from '../../domain/spell/spellsRepository';
import { SpellName } from '../../types/Spell';
import { ButtonName } from '../../types/ButtonName';

const MapActionsControl: React.FC = () => {
  const {
    setShowCastSpellDialog,
    setShowConstructBuildingDialog,
    setShowEmpireTreasureDialog,
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
          !(spell.type === SpellName.TURN_UNDEAD && playerMana[spell.manaType] === 0) &&
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

  const handleShowEmpireTreasureDialog = useCallback(() => {
    if (gameState == null) return;
    const selectedPlayer = getTurnOwner(gameState);
    if (!selectedPlayer) return;
    if (selectedPlayer.empireTreasures.length > 0) {
      setShowEmpireTreasureDialog(true);
    } else {
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        setErrorMessagePopupMessage('No treasures in your empire!');
        setShowErrorMessagePopup(true);
      }
    }
  }, [
    gameState,
    setErrorMessagePopupMessage,
    setShowEmpireTreasureDialog,
    setShowErrorMessagePopup,
  ]);

  const isHuman = gameState ? getTurnOwner(gameState).playerType === 'human' : false;

  return (
    <Activity mode={isHuman ? 'visible' : 'hidden'}>
      <div className={styles.gameControlContainer}>
        <GameButton buttonName={ButtonName.BUILD} onClick={handleShowConstructBuildingDialog} />
        <GameButton buttonName={ButtonName.CAST} onClick={handleShowCastSpellDialog} />
        <GameButton buttonName={ButtonName.ITEMS} onClick={handleShowEmpireTreasureDialog} />
      </div>
    </Activity>
  );
};

export default MapActionsControl;
