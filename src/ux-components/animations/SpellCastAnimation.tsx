import React, { useEffect, useState } from 'react';
import styles from './css/SpellCastAnimation.module.css';
import { ManaType } from '../../types/Mana';
import { getSpellEndAnimationImg } from '../../assets/getSpellImg';

// Animation size constant - easy to adjust
export const SPELL_ANIMATION_SIZE = 200;

interface SpellCastAnimationProps {
  manaType: ManaType;
  onAnimationComplete?: () => void;
  duration?: number; // Duration in milliseconds
}

const SpellCastAnimation: React.FC<SpellCastAnimationProps> = ({
  manaType,
  onAnimationComplete,
  duration = 2000, // 2 seconds
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onAnimationComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onAnimationComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.spellCastAnimation}>
      <img
        src={getSpellEndAnimationImg(manaType)}
        alt={`${manaType} spell cast animation`}
        className={styles.animationImage}
        style={{
          width: SPELL_ANIMATION_SIZE,
          height: SPELL_ANIMATION_SIZE,
        }}
      />
    </div>
  );
};

export default SpellCastAnimation;
