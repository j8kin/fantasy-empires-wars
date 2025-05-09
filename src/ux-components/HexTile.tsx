import React from 'react';
import styles from './Hexagonal.module.css';
const HexTile: React.FC<{ image?: string }> = ({ image }) => {
  return (
    <div className={styles.hexTile}>
      {image ? (
        <img src={image} alt="tile" />
      ) : (
        <p>test</p> // Display "test" when no image is provided
      )}
    </div>
  );
};

export default HexTile;
