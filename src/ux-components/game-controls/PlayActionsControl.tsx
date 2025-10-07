import React from 'react';
import styles from './css/GameControl.module.css';
import GameButton from '../buttons/GameButton';
import { ButtonName } from '../buttons/GameButtonProps';

interface PlayActionsControlProps {
  onBuild?: () => void;
  onCast?: () => void;
  onMove?: () => void;
}

const PlayActionsControl: React.FC<PlayActionsControlProps> = ({ onBuild, onCast, onMove }) => {
  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.BUILD} onClick={onBuild} />
      <GameButton buttonName={ButtonName.CAST} onClick={onCast} />
      <GameButton buttonName={ButtonName.MOVE} onClick={onMove} />
    </div>
  );
};

export default PlayActionsControl;
