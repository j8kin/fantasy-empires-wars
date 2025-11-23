import React from 'react';
import styles from './css/VialPanel.module.css';

import { useGameContext } from '../../contexts/GameContext';

import ManaVial from './ManaVial';

import { ManaType } from '../../types/Mana';
import { getMinManaCost } from '../../types/Spell';

const VialPanel: React.FC = () => {
  const { gameState } = useGameContext();
  const turnOwner = gameState?.turnOwner;

  // do not show mana vials for AI players
  if (turnOwner?.playerType !== 'human') return null;

  // do not show mana vials if not enough mana to cast related school spells
  const availableMana = Object.values(ManaType).filter(
    (manaType) => turnOwner?.mana?.[manaType]! > getMinManaCost(manaType)
  );

  return (
    <div className={styles.vialPanel}>
      {availableMana &&
        availableMana.map((m) => <ManaVial key={m} color={m} mana={turnOwner?.mana?.[m]} />)}
    </div>
  );
};

export default VialPanel;
