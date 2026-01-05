import React, { Activity, useCallback } from 'react';
import styles from './css/GameControl.module.css';

import GameButton from '../buttons/GameButton';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../selectors/playerSelectors';

import { ButtonName } from '../../types/ButtonName';

const GameControl: React.FC = () => {
  const { setShowStartWindow, setShowSaveDialog } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleShowStartWindow = useCallback(() => {
    setShowStartWindow(true);
  }, [setShowStartWindow]);

  const handleShowSaveDialog = useCallback(() => {
    setShowSaveDialog(true);
  }, [setShowSaveDialog]);

  const isHuman = gameState ? getTurnOwner(gameState).playerType === 'human' : false;

  return (
    <Activity mode={isHuman ? 'visible' : 'hidden'}>
      <div className={styles.gameControlContainer}>
        <GameButton buttonName={ButtonName.NEW} onClick={handleShowStartWindow} />
        <GameButton buttonName={ButtonName.LOAD} />
        <GameButton buttonName={ButtonName.SAVE} onClick={handleShowSaveDialog} />
      </div>
    </Activity>
  );
};

export default GameControl;
