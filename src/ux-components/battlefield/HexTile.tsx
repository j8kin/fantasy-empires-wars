import React, { useState } from 'react';
import styles from './css/Hexagonal.module.css';
import { LandType } from '../../types/LandType';
import { HexTileState } from '../../types/HexTileState';
import darkforestImg from '../../assets/map-tiles/darkforest.png';
import greenforestImg from '../../assets/map-tiles/greenforest.png';
import hillsImg from '../../assets/map-tiles/hills.png';
import lavaImg from '../../assets/map-tiles/lava.png';
import mountainsImg from '../../assets/map-tiles/mountains.png';
import plainsImg from '../../assets/map-tiles/plains.png';
import swampImg from '../../assets/map-tiles/swamp.png';
import desertImg from '../../assets/map-tiles/desert.png';
import volcanoImg from '../../assets/map-tiles/volcano.png';
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
    'desert.png': desertImg,
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
