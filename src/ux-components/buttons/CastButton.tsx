import React from 'react';
import styles from './css/GameButton.module.css';
import { GameButtonProps } from './GameButtonProps';
import Cast from '../../assets/buttons/Cast.png';

const CastButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleCast = () => {
    alert('CastButton clicked! onClick handler: ' + (onClick ? 'present' : 'not provided'));
    if (onClick) {
      onClick();
    }
  };

  return <img src={Cast} alt="Cast Spell" className={styles.buttonImage} onClick={handleCast} />;
};

export default CastButton;
