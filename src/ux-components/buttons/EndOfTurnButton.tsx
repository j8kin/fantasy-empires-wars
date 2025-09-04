import React from 'react';
import styles from './css/EndOfTurnButton.module.css';
import EndOfTurn from '../../assets/images/EndOfTurn.png';

interface EndOfTurnButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
}

const EndOfTurnButton: React.FC<EndOfTurnButtonProps> = ({ onClick, style }) => {
  const handleEndTurnClick = () => {
    alert('End of Turn button is pressed!');
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={styles.endOfTurnButtonContainer} style={style}>
      <img src={EndOfTurn} alt="End Turn" className={styles.endOfTurnImage} onClick={handleEndTurnClick} />
    </div>
  );
};

export default EndOfTurnButton;
