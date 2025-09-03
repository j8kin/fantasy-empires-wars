import React from 'react';
import EndOfTurn from '../../assets/images/EndOfTurn.png';
import './css/EndOfTurnButton.css';

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
    <button onClick={handleEndTurnClick} className="end-of-turn-button" style={style}>
      <img src={EndOfTurn} alt="End Turn" />
    </button>
  );
};

export default EndOfTurnButton;
