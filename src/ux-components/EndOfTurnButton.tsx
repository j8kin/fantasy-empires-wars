import React from 'react';
import EndOfTurn from '../assets/images/EndOfTurn.png';

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
    <button
      onClick={handleEndTurnClick}
      style={{
        ...buttonStyle,
        ...style,
      }}
    >
      <img src={EndOfTurn} alt="End Turn" style={imageStyle} />
    </button>
  );
};

const buttonStyle: React.CSSProperties = {
  position: 'absolute',
  width: '100px',
  height: '100px',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  zIndex: 10,
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

export default EndOfTurnButton;