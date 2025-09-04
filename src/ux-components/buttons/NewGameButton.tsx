import React from 'react';
import styles from './css/GameButton.module.css';
import NewGame from '../../assets/images/NewGame.png';

interface NewGameButtonProps {
  onClick?: () => void;
}

const NewGameButton: React.FC<NewGameButtonProps> = ({ onClick }) => {
  const handleNewGame = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <img src={NewGame} alt="New Game" className={styles.buttonImage} onClick={handleNewGame} />
  );
};

export default NewGameButton;
