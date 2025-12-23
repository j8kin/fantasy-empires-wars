import React from 'react';
import styles from './css/ManaVial.module.css';

import { useGameContext } from '../../contexts/GameContext';
import { getMaxHeroLevelByType } from '../../selectors/armySelectors';
import { getManaColor, getManaGradient } from '../../domain/ui/manaColors';
import { getManaSource } from '../../domain/mana/manaSource';

import { getManaVialImg } from '../../assets/getManaVialImg';

import { Mana, MAX_MANA } from '../../types/Mana';
import { AllSpells } from '../../domain/spell/spellsRepository';

import type { GameState } from '../../state/GameState';
import type { ManaType } from '../../types/Mana';

interface FilledManaVialProps {
  color: ManaType;
  mana?: number;
}

/**
 * Calculate discrete fill level based on spell availability
 * Returns:
 * - 10% when mana > 0 and related mage is under control but no spells available
 * - 27% when first spell is available
 * - 45% when second spell is available
 * - 62% when third spell is available
 * - 80% when fourth spell is available
 * - 100% when mana >= 200 (full mana pool or exchange mode)
 */
const calculateFillLevel = (gameState: GameState, manaType: ManaType, cMana: number): number => {
  if (cMana >= MAX_MANA) return 100;

  const maxHeroLevel = getMaxHeroLevelByType(gameState, getManaSource({ manaType })!.heroTypes[0]);

  const availableSpells = AllSpells.reduce(
    (acc, s) => acc + (s.manaType === manaType && s.manaCost <= cMana ? 1 : 0),
    0
  );

  switch (availableSpells) {
    case 0:
      // if not enough mana and no mage under control, return 0 fill level
      return maxHeroLevel > 0 ? 10 : 0;
    case 1:
      // TURN_UNDEAD available to cast only if CLERIC hero is under control
      if (manaType === Mana.WHITE && maxHeroLevel === 0) return 0;
      return 27;
    case 2:
      return 45;
    case 3:
      return 62;
    default:
      return 80; // all spells available but mana pull is not fully filled
  }
};

const ManaVial: React.FC<FilledManaVialProps> = ({ color, mana }) => {
  const { gameState } = useGameContext();

  if (gameState == null || mana == null) return null;

  const fillLevel = calculateFillLevel(gameState, color, mana);

  if (fillLevel === 0) return null;

  const [baseColor, darkerColor] = getManaGradient(color);
  const fillStyle: React.CSSProperties = {
    // Fill from bottom based on spell availability
    background: `linear-gradient(${baseColor}, ${darkerColor})`,
    boxShadow: `0 0 8px ${getManaColor(color)}80`,
    height: `${fillLevel}%`,
    bottom: 0,
    top: 'auto',
  };

  return (
    <div className={styles.vialContainer} data-testid={color + '-filled-mana-vial'}>
      <div className={styles.fillContainer}>
        <div className={styles.fillContent} style={fillStyle}></div>
        <div className={styles.fillBorder}></div>
      </div>
      <img src={getManaVialImg()} className={styles.vialImage} alt={`${color} mana vial`} />
    </div>
  );
};

export default ManaVial;
