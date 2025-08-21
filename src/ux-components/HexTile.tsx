import React from 'react';
import styles from './css/Hexagonal.module.css';
import { LandType } from '../types/LandType';
import darkforestImg from '../maps/darkforest.png';
import greenforestImg from '../maps/greenforest.png';
import hillsImg from '../maps/hills.png';
import lavaImg from '../maps/lava.png';
import mountainsImg from '../maps/mountains.png';
import plainsImg from '../maps/plains.png';
import swampImg from '../maps/swamp.png';
import volcanoImg from '../maps/volcano.png';

interface HexTileProps {
  landType?: LandType;
  image?: string;
}

const HexTile: React.FC<HexTileProps> = ({ landType, image }) => {
  const imageMap: { [key: string]: string } = {
    'darkforest.png': darkforestImg,
    'greenforest.png': greenforestImg,
    'hills.png': hillsImg,
    'lava.png': lavaImg,
    'mountains.png': mountainsImg,
    'plains.png': plainsImg,
    'swamp.png': swampImg,
    'volcano.png': volcanoImg,
  };

  const imageSrc = landType ? imageMap[landType.imageName] : image;
  const altText = landType ? landType.name : 'tile';

  return (
    <div
      className={styles.hexTile}
      title={landType ? `${landType.name} (${landType.alignment})` : undefined}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={altText} className={styles.hexTileImg} />
      ) : (
        <p>test</p>
      )}
    </div>
  );
};

export default HexTile;
