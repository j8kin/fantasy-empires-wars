import React, { useState } from 'react';
import styles from './css/Hexagonal.module.css';
import { LandType } from '../types/LandType';
import { HexTileState } from '../types/HexTileState';
import darkforestImg from '../maps/darkforest.png';
import greenforestImg from '../maps/greenforest.png';
import hillsImg from '../maps/hills.png';
import lavaImg from '../maps/lava.png';
import mountainsImg from '../maps/mountains.png';
import plainsImg from '../maps/plains.png';
import swampImg from '../maps/swamp.png';
import volcanoImg from '../maps/volcano.png';
import LandCharacteristicsPopup from './LandCharacteristicsPopup';

interface HexTileProps {
  landType?: LandType;
  image?: string;
  tileState?: HexTileState;
}

const HexTile: React.FC<HexTileProps> = ({ landType, image, tileState }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

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

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setPopupPosition({ x: event.clientX, y: event.clientY });
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div
        className={styles.hexTile}
        title={landType ? `${landType.name} (${landType.alignment})` : undefined}
        onContextMenu={handleRightClick}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={altText} className={styles.hexTileImg} />
        ) : (
          <p>test</p>
        )}
      </div>
      {showPopup && (landType || tileState) && (
        <LandCharacteristicsPopup
          landType={landType}
          tileState={tileState}
          position={popupPosition}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default HexTile;
