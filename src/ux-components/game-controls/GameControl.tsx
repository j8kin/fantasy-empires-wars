import React from 'react';
import styles from './css/GameControl.module.css';
import NewGameButton from '../buttons/NewGameButton';
import LoadGameButton from '../buttons/LoadGameButton';
import SaveGameButton from '../buttons/SaveGameButton';

interface GameControlProps {
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onSaveGame?: () => void;
}

const GameControl: React.FC<GameControlProps> = ({ onNewGame, onLoadGame, onSaveGame }) => {
  return (
    <div className={styles.gameControlContainer}>
      <NewGameButton onClick={onNewGame} />
      <LoadGameButton onClick={onLoadGame} />
      <SaveGameButton onClick={onSaveGame} />
    </div>
  );
};

export default GameControl;
