import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import GameButton, { ButtonName } from '../buttons/GameButton';

const GameControl: React.FC = () => {
  const { setShowStartWindow, setShowSaveDialog } = useApplicationContext();

  const handleShowStartWindow = useCallback(() => {
    setShowStartWindow(true);
  }, [setShowStartWindow]);

  const handleShowSaveDialog = useCallback(() => {
    setShowSaveDialog(true);
  }, [setShowSaveDialog]);

  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.NEW} onClick={handleShowStartWindow} />
      <GameButton buttonName={ButtonName.LOAD} />
      <GameButton buttonName={ButtonName.SAVE} onClick={handleShowSaveDialog} />
    </div>
  );
};

export default GameControl;
