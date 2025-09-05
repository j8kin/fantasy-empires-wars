import React from 'react';
import ManaVial from './ManaVial';
import styles from './css/VialPanel.module.css';

const VialPanel: React.FC = () => {
  return (
    <div className={styles.vialPanel}>
      <ManaVial color="black" percentage={75} />
      <ManaVial color="white" percentage={50} />
      <ManaVial color="blue" percentage={100} />
      <ManaVial color="green" percentage={25} />
      <ManaVial color="red" percentage={5} />
    </div>
  );
};

export default VialPanel;
