import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import GameButton, { ButtonName } from '../buttons/GameButton';

const PlayActionsControl: React.FC = () => {
  const { setShowCastSpellDialog, setShowConstructBuildingDialog } = useApplicationContext();

  const handleShowCastSpellDialog = useCallback(() => {
    setShowCastSpellDialog(true);
  }, [setShowCastSpellDialog]);

  const handleShowConstructBuildingDialog = useCallback(() => {
    setShowConstructBuildingDialog(true);
  }, [setShowConstructBuildingDialog]);

  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.BUILD} onClick={handleShowConstructBuildingDialog} />
      <GameButton buttonName={ButtonName.CAST} onClick={handleShowCastSpellDialog} />
      <GameButton buttonName={ButtonName.MOVE} />
    </div>
  );
};

export default PlayActionsControl;
