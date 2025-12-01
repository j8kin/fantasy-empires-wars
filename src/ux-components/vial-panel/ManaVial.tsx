import React from 'react';
import styles from './css/ManaVial.module.css';

import { getManaColor, getManaGradient } from '../../domain/ui/manaColors';
import { ManaType, MAX_MANA } from '../../types/Mana';

import { getManaVialImg } from '../../assets/getManaVialImg';

interface FilledManaVialProps {
  color: ManaType;
  mana?: number;
}

const ManaVial: React.FC<FilledManaVialProps> = ({ color, mana }) => {
  if (mana == null) return null;

  const percentage = mana >= MAX_MANA ? 100 : (mana * 100) / MAX_MANA;
  // Use element opacity on inner content so color fades with mana, while border (outer) remains solid
  const opacity = Math.max(0, Math.min(1, percentage / 70));

  const [baseColor, darkerColor] = getManaGradient(color);
  const fillStyle: React.CSSProperties = {
    // Inner content carries the fading color while outer keeps the solid border
    background: `linear-gradient(${baseColor}, ${darkerColor})`,
    boxShadow: `0 0 8px ${getManaColor(color)}80`,
    opacity,
  };

  return (
    <div className={styles.vialContainer} data-testid={color + '-filled-mana-vial'}>
      <div className={styles.fillContainer}>
        <div className={styles.fill}>
          <div className={styles.fillContent} style={fillStyle}></div>
        </div>
      </div>
      <img src={getManaVialImg()} className={styles.vialImage} alt={`${color} mana vial`} />
    </div>
  );
};

export default ManaVial;
