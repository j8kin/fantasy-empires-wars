import React, { Activity, useEffect } from 'react';
import styles from './css/SpellCastAnimation.module.css';
import { getSpellEndAnimationImg } from '../../assets/getSpellImg';

import { useApplicationContext } from '../../contexts/ApplicationContext';

// Animation size constant - easy to adjust
const SPELL_ANIMATION_SIZE = 200;

interface SpellCastAnimationProps {
  onAnimationComplete?: () => void;
  duration?: number; // Duration in milliseconds
}

const SpellCastAnimation: React.FC<SpellCastAnimationProps> = ({
  onAnimationComplete,
  duration = 2000, // 2 seconds
}) => {
  const { spellAnimation, setSpellAnimation } = useApplicationContext();

  useEffect(() => {
    if (spellAnimation == null) {
      return;
    }

    const timer = setTimeout(() => {
      setSpellAnimation(null);
      onAnimationComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [spellAnimation, duration, onAnimationComplete, setSpellAnimation]);

  return (
    <Activity mode={spellAnimation != null ? 'visible' : 'hidden'}>
      <div
        style={{
          position: 'fixed',
          left: spellAnimation?.screenPosition.x ?? 0,
          top: spellAnimation?.screenPosition.y ?? 0,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        <div className={styles.spellCastAnimation}>
          <img
            src={
              spellAnimation != null ? getSpellEndAnimationImg(spellAnimation.manaType) : undefined
            }
            alt={`${spellAnimation?.manaType} spell cast animation`}
            className={styles.animationImage}
            style={{
              width: SPELL_ANIMATION_SIZE,
              height: SPELL_ANIMATION_SIZE,
            }}
          />
        </div>
      </div>
    </Activity>
  );
};

export default SpellCastAnimation;
