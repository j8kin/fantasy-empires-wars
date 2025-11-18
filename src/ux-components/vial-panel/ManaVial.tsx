import React from 'react';
import styles from './css/ManaVial.module.css';

import { getManaColor, getManaGradient, ManaType, MAX_MANA } from '../../types/Mana';

import { getManaVialImg } from '../../assets/getManaVialImg';

interface FilledManaVialProps {
  color: ManaType;
  mana?: number;
}

const ManaVial: React.FC<FilledManaVialProps> = ({ color, mana }) => {
  if (mana == null) return null;

  const percentage = mana >= MAX_MANA ? 100 : (mana * 100) / MAX_MANA;
  const opacity = percentage / 30;

  const [baseColor, darkerColor] = getManaGradient(color);
  const fillStyle: React.CSSProperties = {
    background: `linear-gradient(${baseColor}, ${darkerColor})`,
    boxShadow: `0 0 8px ${getManaColor(color)}80`,
    opacity: opacity,
  };

  return (
    <div className={styles.vialContainer} data-testid={color + '-filled-mana-vial'}>
      <div className={styles.fillContainer}>
        <div className={styles.fill} style={fillStyle}></div>
      </div>
      <img src={getManaVialImg()} className={styles.vialImage} alt={`${color} mana vial`} />
      {/*<span className={styles.value} data-testid={color + '-mana-vial-percentage'}>*/}
      {/*  {percentage}%*/}
      {/*</span>*/}
    </div>
  );
};

export default ManaVial;
