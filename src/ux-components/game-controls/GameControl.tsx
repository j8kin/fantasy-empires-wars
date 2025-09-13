import React from 'react';
import styles from './css/GameControl.module.css';
import NewGameButton from '../buttons/NewGameButton';
import LoadGameButton from '../buttons/LoadGameButton';
import OpenSaveDialogButton from '../buttons/OpenSaveDialogButton';

interface GameControlProps {
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onOpenSaveDialog?: () => void;
}

const GameControl: React.FC<GameControlProps> = ({ onNewGame, onLoadGame, onOpenSaveDialog }) => {
  return (
    <div className={styles.gameControlContainer}>
      <NewGameButton onClick={onNewGame} />
      <LoadGameButton onClick={onLoadGame} />
      <OpenSaveDialogButton onClick={onOpenSaveDialog} />
    </div>
  );
};

export default GameControl;
