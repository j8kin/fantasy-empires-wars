import React from 'react';
import styles from './css/VialPanel.module.css';

import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../types/GameState';

import ManaVial from './ManaVial';

import { ManaType } from '../../types/Mana';

const VialPanel: React.FC = () => {
  const { gameState } = useGameContext();
  const selectedPlayer = getTurnOwner(gameState);

  return (
    <div className={styles.vialPanel}>
      <ManaVial color={ManaType.BLACK} mana={selectedPlayer?.mana?.black} />
      <ManaVial color={ManaType.WHITE} mana={selectedPlayer?.mana?.white} />
      <ManaVial color={ManaType.BLUE} mana={selectedPlayer?.mana?.blue} />
      <ManaVial color={ManaType.GREEN} mana={selectedPlayer?.mana?.green} />
      <ManaVial color={ManaType.RED} mana={selectedPlayer?.mana?.red} />
    </div>
  );
};

export default VialPanel;
