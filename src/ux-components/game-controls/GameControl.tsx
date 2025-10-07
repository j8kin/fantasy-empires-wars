import React from 'react';
import styles from './css/GameControl.module.css';
import GameButton from '../buttons/GameButton';
import { ButtonName } from '../buttons/GameButtonProps';

interface GameControlProps {
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onOpenSaveDialog?: () => void;
}

const GameControl: React.FC<GameControlProps> = ({ onNewGame, onLoadGame, onOpenSaveDialog }) => {
  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.NEW} onClick={onNewGame} />
      <GameButton buttonName={ButtonName.LOAD} onClick={onLoadGame} />
      <GameButton buttonName={ButtonName.SAVE} onClick={onOpenSaveDialog} />
    </div>
  );
};

export default GameControl;
