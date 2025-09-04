import React from 'react';
import styles from './css/GameControl.module.css';
import NewGame from '../../assets/images/NewGame.png';
import LoadGame from '../../assets/images/LoadGame.png';
import SaveGame from '../../assets/images/SaveGame.png';

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
      <img
        src={NewGame}
        alt="New Game"
        className={styles.gameControlButtonImage}
        onClick={handleNewGame}
      />
      <img
        src={LoadGame}
        alt="Load Game"
        className={styles.gameControlButtonImage}
        onClick={handleLoadGame}
      />
      <img
        src={SaveGame}
        alt="Save Game"
        className={styles.gameControlButtonImage}
        onClick={handleSaveGame}
      />
    </div>
  );
};

export default GameControl;
