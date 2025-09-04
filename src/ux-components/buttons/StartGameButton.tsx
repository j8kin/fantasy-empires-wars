import React from 'react';
import styles from './css/GameButton.module.css';
import StartGame from '../../assets/images/StartGame.png';

interface StartGameButtonProps {
  onClick: () => void;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ onClick }) => {
  return (
    <div className={styles.buttonContainerCentered}>
      <img src={StartGame} alt="Start Game" className={styles.buttonImage} onClick={onClick} />
    </div>
  );
};

export default StartGameButton;
