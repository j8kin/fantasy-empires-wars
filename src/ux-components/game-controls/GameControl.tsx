import React from 'react';
import styles from './css/GameControl.module.css';

interface GameControlProps {
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onSaveGame?: () => void;
}

const GameControl: React.FC<GameControlProps> = ({ onNewGame, onLoadGame, onSaveGame }) => {
  const handleNewGame = () => {
    if (onNewGame) {
      onNewGame();
    }
  };

  const handleLoadGame = () => {
    console.log('Load Game clicked');
    if (onLoadGame) {
      onLoadGame();
    }
  };

  const handleSaveGame = () => {
    console.log('Save Game clicked');
    if (onSaveGame) {
      onSaveGame();
    }
  };

  return (
    <div className={styles.gameControlContainer}>
      <button className={styles.gameControlButton} onClick={handleNewGame}>
        New Game
      </button>
      <button className={styles.gameControlButton} onClick={handleLoadGame}>
        Load Game
      </button>
      <button className={styles.gameControlButton} onClick={handleSaveGame}>
        Save Game
      </button>
    </div>
  );
};

export default GameControl;
