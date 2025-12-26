import React from 'react';
import styles from './css/VialPanel.module.css';

import ManaVial from './ManaVial';

import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { Mana } from '../../types/Mana';

const VialPanel: React.FC = () => {
  const { gameState } = useGameContext();

  if (!gameState) return null;
  const turnOwner = getTurnOwner(gameState);

  if (!turnOwner || turnOwner.playerType !== 'human') return null;

  return (
    <div className={styles.vialPanel}>
      {Object.values(Mana).map((m) => (
        <ManaVial key={m} color={m} mana={turnOwner?.mana?.[m]} />
      ))}
    </div>
  );
};

export default VialPanel;
