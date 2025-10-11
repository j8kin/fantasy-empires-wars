import React from 'react';
import styles from './css/VialPanel.module.css';

import { useGameState } from '../../contexts/GameContext';

import ManaVial from './ManaVial';

import { ManaType } from '../../types/Mana';

const VialPanel: React.FC = () => {
  const { gameState } = useGameState();

  return (
    <div className={styles.vialPanel}>
      <ManaVial color={ManaType.BLACK} mana={gameState.selectedPlayer?.mana?.black || 130} />
      <ManaVial color={ManaType.WHITE} mana={gameState.selectedPlayer?.mana?.white || 400} />
      <ManaVial color={ManaType.BLUE} mana={gameState.selectedPlayer?.mana?.blue || 100} />
      <ManaVial color={ManaType.GREEN} mana={gameState.selectedPlayer?.mana?.green || 50} />
      <ManaVial color={ManaType.RED} mana={gameState.selectedPlayer?.mana?.red || 10} />
    </div>
  );
};

export default VialPanel;
