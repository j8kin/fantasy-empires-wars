import React from 'react';
import ManaVial from './ManaVial';
import styles from './css/VialPanel.module.css';

const VialPanel: React.FC = () => {
  return (
    <div className={styles.vialPanel}>
      <ManaVial color="black" mana={130} />
      <ManaVial color="white" mana={400} />
      <ManaVial color="blue" mana={100} />
      <ManaVial color="green" mana={50} />
      <ManaVial color="red" mana={10} />
    </div>
  );
};

export default VialPanel;
