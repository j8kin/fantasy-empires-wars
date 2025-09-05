import React from 'react';
import styles from './css/ManaVial.module.css';

interface ManaVialProps {
  color: string; // Base color of the ball (e.g., 'rgb(0, 0, 255)')
  percentage: number; // Fill percentage (0 to 100)
}

const ManaVial: React.FC<ManaVialProps> = ({ color, percentage }) => {
  const fillStyle: React.CSSProperties = {
    height: `${percentage}%`,
    backgroundColor: color,
  };

  return (
    <div className={styles.ball}>
      <div className={styles.fill} style={fillStyle}></div>
      <span className={styles.value}>{percentage}%</span>
    </div>
  );
};

export default ManaVial;
