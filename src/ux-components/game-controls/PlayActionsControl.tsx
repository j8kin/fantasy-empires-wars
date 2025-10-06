import React from 'react';
import styles from './css/GameControl.module.css';
import GameButton from '../buttons/GameButton';

interface PlayActionsControlProps {
  onBuild?: () => void;
  onCast?: () => void;
  onMove?: () => void;
}

const PlayActionsControl: React.FC<PlayActionsControlProps> = ({ onBuild, onCast, onMove }) => {
  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName="build" onClick={onBuild} />
      <GameButton buttonName="cast" onClick={onCast} />
      <GameButton buttonName="move" onClick={onMove} />
    </div>
  );
};

export default PlayActionsControl;
