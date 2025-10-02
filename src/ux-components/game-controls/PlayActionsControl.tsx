import React from 'react';
import styles from './css/GameControl.module.css';
import BuildButton from '../buttons/BuildButton';
import CastButton from '../buttons/CastButton';
import MoveButton from '../buttons/MoveButton';

interface PlayActionsControlProps {
  onBuild?: () => void;
  onCast?: () => void;
  onMove?: () => void;
}

const PlayActionsControl: React.FC<PlayActionsControlProps> = ({ onBuild, onCast, onMove }) => {
  return (
    <div className={styles.gameControlContainer}>
      <BuildButton onClick={onBuild} />
      <CastButton onClick={onCast} />
      <MoveButton onClick={onMove} />
    </div>
  );
};

export default PlayActionsControl;
