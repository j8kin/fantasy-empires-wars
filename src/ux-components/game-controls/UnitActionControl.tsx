import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import { ButtonName } from '../../types/ButtonName';
import GameButton from '../buttons/GameButton';

const UnitActionControl: React.FC = () => {
  const { setShowRecruitArmyDialog } = useApplicationContext();

  const handleShowRecruitArmyDialog = useCallback(() => {
    setShowRecruitArmyDialog(true);
  }, [setShowRecruitArmyDialog]);

  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.RECRUIT} onClick={handleShowRecruitArmyDialog} />
      <GameButton buttonName={ButtonName.MOVE} />
      <GameButton buttonName={ButtonName.QUEST} />
    </div>
  );
};

export default UnitActionControl;
