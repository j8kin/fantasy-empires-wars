import React from 'react';
import styles from './css/GameButton.module.css';
import EndOfTurn from '../../assets/buttons/EndOfTurn.png';
import { GameButtonProps } from './GameButtonProps';

const EndOfTurnButton: React.FC<GameButtonProps> = ({ onClick, style }) => {
  const handleEndTurnClick = () => {
    alert('End of Turn button is pressed!');
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={styles.buttonContainer} style={style}>
      <img
        src={EndOfTurn}
        alt="End Turn"
        className={styles.buttonImage}
        onClick={handleEndTurnClick}
      />
    </div>
  );
};

export default EndOfTurnButton;
