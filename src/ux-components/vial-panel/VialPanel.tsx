import React, { Activity } from 'react';
import styles from './css/VialPanel.module.css';

import ManaVial from './ManaVial';

import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { Mana } from '../../types/Mana';

const VialPanel: React.FC = () => {
  const { gameState } = useGameContext();
  const turnOwner = gameState ? getTurnOwner(gameState) : undefined;

  return (
    <Activity mode={!gameState || turnOwner?.playerType !== 'human' ? 'hidden' : 'visible'}>
      <div className={styles.vialPanel}>
        {Object.values(Mana).map((m) => (
          <ManaVial key={m} color={m} mana={turnOwner?.mana?.[m]} />
        ))}
      </div>
    </Activity>
  );
};

export default VialPanel;
