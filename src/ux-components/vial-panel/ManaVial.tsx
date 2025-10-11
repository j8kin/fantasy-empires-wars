import React from 'react';
import styles from './css/ManaVial.module.css';

import { Mana } from '../../types/Mana';

const ManaVial: React.FC<Mana> = ({ color, mana }) => {
  const MANA_100_PERCENTAGE = 200;
  const percentage = mana >= MANA_100_PERCENTAGE ? 100 : mana / 2;

  const fillStyle: React.CSSProperties = {
    height: `${percentage}%`,
    backgroundColor: color,
  };

  return (
    <div className={styles.ball} data-testid={color + '-mana-vial'}>
      <div className={styles.fill} style={fillStyle}></div>
      <span className={styles.value} data-testid={color + '-mana-vial-percentage'}>
        {percentage}%
      </span>
    </div>
  );
};

export default ManaVial;
