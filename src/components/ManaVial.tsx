import React from 'react';

const Radius = 80;

interface ManaVialProps {
  color: string; // Base color of the ball (e.g., 'rgb(0, 0, 255)')
  percentage: number; // Fill percentage (0 to 100)
}

const ManaVial: React.FC<ManaVialProps> = ({ color, percentage }) => {
  const ballStyle: React.CSSProperties = {
    width: `${Radius}px`,
    height: `${Radius}px`,
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden', // Ensures the fill doesn't overflow the ball
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    border: '2px solid rgba(0, 0, 0, 0.1)',
  };

  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0, // Start filling from the bottom
    left: 0,
    width: '100%',
    height: `${percentage}%`, // Fill height based on percentage
    backgroundColor: color, // Use the provided color
    transition: 'height 0.3s ease', // Smooth transition for dynamic updates
  };

  const valueStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '24px',
    color: 'white',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
  };

  return (
    <div style={ballStyle}>
      <div style={fillStyle}></div>
      <span style={valueStyle}>{percentage}%</span>
    </div>
  );
};

export default ManaVial;
