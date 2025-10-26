import React from 'react';
import styles from './css/GameControl.module.css';
import { ButtonName } from '../../types/ButtonName';
import GameButton from '../buttons/GameButton';

const UnitActionControl: React.FC = () => {
  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.RECRUIT} />
      <GameButton buttonName={ButtonName.MOVE} />
      <GameButton buttonName={ButtonName.QUEST} />
    </div>
  );
};

export default UnitActionControl;
