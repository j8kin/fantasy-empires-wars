import React from 'react';
import styles from './css/VialPanel.module.css';

import ManaVial from './ManaVial';

import { ManaType } from '../../types/Mana';

const VialPanel: React.FC = () => {
  return (
    <div className={styles.vialPanel}>
      <ManaVial color={ManaType.BLACK} mana={130} />
      <ManaVial color={ManaType.WHITE} mana={400} />
      <ManaVial color={ManaType.BLUE} mana={100} />
      <ManaVial color={ManaType.GREEN} mana={50} />
      <ManaVial color={ManaType.RED} mana={10} />
    </div>
  );
};

export default VialPanel;
