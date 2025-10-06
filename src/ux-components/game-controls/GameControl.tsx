import React from 'react';
import styles from './css/GameControl.module.css';
import GameButton from '../buttons/GameButton';

interface GameControlProps {
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onOpenSaveDialog?: () => void;
}

const GameControl: React.FC<GameControlProps> = ({ onNewGame, onLoadGame, onOpenSaveDialog }) => {
  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName="newgame" onClick={onNewGame} />
      <GameButton buttonName="loadgame" onClick={onLoadGame} />
      <GameButton buttonName="savegame" onClick={onOpenSaveDialog} />
    </div>
  );
};

export default GameControl;
