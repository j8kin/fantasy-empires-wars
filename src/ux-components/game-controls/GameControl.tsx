import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import GameButton from '../buttons/GameButton';
import { ButtonName } from '../../types/ButtonName';
import { getTurnOwner } from '../../types/GameState';

const GameControl: React.FC = () => {
  const { setShowStartWindow, setShowSaveDialog } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleShowStartWindow = useCallback(() => {
    setShowStartWindow(true);
  }, [setShowStartWindow]);

  const handleShowSaveDialog = useCallback(() => {
    setShowSaveDialog(true);
  }, [setShowSaveDialog]);

  if (getTurnOwner(gameState)?.playerType !== 'human') return null;

  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.NEW} onClick={handleShowStartWindow} />
      <GameButton buttonName={ButtonName.LOAD} />
      <GameButton buttonName={ButtonName.SAVE} onClick={handleShowSaveDialog} />
    </div>
  );
};

export default GameControl;
