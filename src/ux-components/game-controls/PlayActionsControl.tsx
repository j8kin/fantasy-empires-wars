import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import GameButton from '../buttons/GameButton';
import { useGameContext } from '../../contexts/GameContext';
import { getAllBuildings } from '../../types/Building';
import { ButtonName } from '../../types/ButtonName';
import { AllSpells, SpellName } from '../../types/Spell';

const PlayActionsControl: React.FC = () => {
  const { setShowCastSpellDialog, setShowConstructBuildingDialog } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleShowCastSpellDialog = useCallback(() => {
    if (gameState == null) return;
    const playerMana = gameState.selectedPlayer.mana!;
    if (
      AllSpells.some(
        (spell) =>
          // turn undead could only be cast if related mana is available
          // todo it should be possible to cast turn undead only once per turn
          !(spell.id === SpellName.TURN_UNDEAD && playerMana[spell.school] === 0) &&
          spell.manaCost <= playerMana[spell.school]
      )
    ) {
      setShowCastSpellDialog(true);
    } else {
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        // todo replace with Popup with "Not enough mana to cast Spells!" message"
        alert('Not enough mana to cast Spells!');
      }
    }
  }, [gameState, setShowCastSpellDialog]);

  const handleShowConstructBuildingDialog = useCallback(() => {
    if (gameState == null) return;
    if (
      getAllBuildings().some((building) => building.buildCost <= gameState.selectedPlayer.money!)
    ) {
      setShowConstructBuildingDialog(true);
    } else {
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        // todo replace with Popup with "Not enough money to construct a building!" message"
        alert('Not enough money to construct a building!');
      }
    }
  }, [gameState, setShowConstructBuildingDialog]);

  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.BUILD} onClick={handleShowConstructBuildingDialog} />
      <GameButton buttonName={ButtonName.CAST} onClick={handleShowCastSpellDialog} />
      <GameButton buttonName={ButtonName.MOVE} />
    </div>
  );
};

export default PlayActionsControl;
