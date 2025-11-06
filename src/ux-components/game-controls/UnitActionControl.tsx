import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import { ButtonName } from '../../types/ButtonName';
import GameButton from '../buttons/GameButton';

const UnitActionControl: React.FC = () => {
  const { setShowRecruitArmyDialog, setShowSendHeroInQuestDialog } = useApplicationContext();

  const handleShowRecruitArmyDialog = useCallback(() => {
    setShowRecruitArmyDialog(true);
  }, [setShowRecruitArmyDialog]);

  const handleShowSendHeroInQuestDialog = useCallback(() => {
    setShowSendHeroInQuestDialog(true);
  }, [setShowSendHeroInQuestDialog]);

  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.RECRUIT} onClick={handleShowRecruitArmyDialog} />
      <GameButton buttonName={ButtonName.MOVE} />
      <GameButton buttonName={ButtonName.QUEST} onClick={handleShowSendHeroInQuestDialog} />
    </div>
  );
};

export default UnitActionControl;
