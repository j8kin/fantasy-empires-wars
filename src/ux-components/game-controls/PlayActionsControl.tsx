import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import GameButton from '../buttons/GameButton';
import { useGameContext } from '../../contexts/GameContext';
import { getAllBuildings } from '../../types/Building';
import { ButtonName } from '../../types/ButtonName';

const PlayActionsControl: React.FC = () => {
  const { setShowCastSpellDialog, setShowConstructBuildingDialog } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleShowCastSpellDialog = useCallback(() => {
    setShowCastSpellDialog(true);
  }, [setShowCastSpellDialog]);

  const handleShowConstructBuildingDialog = useCallback(() => {
    if (
      gameState != null &&
      getAllBuildings().some((bilding) => bilding.buildCost <= gameState.selectedPlayer.money!)
    )
      setShowConstructBuildingDialog(true);
    else {
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
