import React from 'react';
import styles from './css/GameButton.module.css';
import { GameButtonProps } from './GameButtonProps';
import Move from '../../assets/buttons/Move.png';

const MoveButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleMove = () => {
    alert('MoveButton clicked! onClick handler: ' + (onClick ? 'present' : 'not provided'));
    if (onClick) {
      onClick();
    }
  };

  return <img src={Move} alt="Move army" className={styles.buttonImage} onClick={handleMove} />;
};

export default MoveButton;
