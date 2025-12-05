import React, { useEffect, useState } from 'react';
import styles from './SpellCastAnimation.module.css';
import { ManaType } from '../../types/Mana';

// Animation size constant - easy to adjust
export const SPELL_ANIMATION_SIZE = 150;

interface SpellCastAnimationProps {
  manaType: ManaType;
  onAnimationComplete?: () => void;
  duration?: number; // Duration in milliseconds
}

const SpellCastAnimation: React.FC<SpellCastAnimationProps> = ({
  manaType,
  onAnimationComplete,
  duration = 3000, // Default 3 seconds
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onAnimationComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onAnimationComplete]);

  // Get the animation image based on mana type
  const getAnimationImageSrc = (manaType: ManaType): string => {
    try {
      // For now, we only have white and black animation images
      // When more colors are added, just add the corresponding PNG files
      switch (manaType) {
        case ManaType.WHITE:
          return require('../../assets/spells/_animation/white-end.png');
        case ManaType.BLACK:
          return require('../../assets/spells/_animation/black-end.png');
        case ManaType.BLUE:
        case ManaType.GREEN:
        case ManaType.RED:
          // Fallback to white for colors that don't have animation images yet
          return require('../../assets/spells/_animation/white-end.png');
        default:
          return require('../../assets/spells/_animation/white-end.png');
      }
    } catch (error) {
      console.warn(`Animation image not found for mana type: ${manaType}`, error);
      return require('../../assets/spells/_animation/white-end.png');
    }
  };

  if (!isVisible) {
    return null;
  }

  const imageSrc = getAnimationImageSrc(manaType);

  return (
    <div className={styles.spellCastAnimation}>
      <img
        src={imageSrc}
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
