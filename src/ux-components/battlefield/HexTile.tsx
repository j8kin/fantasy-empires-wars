import React, { useState } from 'react';
import styles from './css/Hexagonal.module.css';
import { createTileId, GameState } from '../../types/HexTileState';
import LandCharacteristicsPopup from './LandCharacteristicsPopup';
import { Position } from '../../map/utils/mapTypes';

import darkforestImg from '../../assets/map-tiles/darkforest.png';
import greenforestImg from '../../assets/map-tiles/greenforest.png';
import hillsImg from '../../assets/map-tiles/hills.png';
import lavaImg from '../../assets/map-tiles/lava.png';
import mountainsImg from '../../assets/map-tiles/mountains.png';
import plainsImg from '../../assets/map-tiles/plains.png';
import swampImg from '../../assets/map-tiles/swamp.png';
import desertImg from '../../assets/map-tiles/desert.png';
import volcanoImg from '../../assets/map-tiles/volcano.png';

interface HexTileProps {
  battlefieldPosition: Position;
  gameState: GameState;
}

const HexTile: React.FC<HexTileProps> = ({ battlefieldPosition, gameState }) => {
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
  const battlefieldTile = gameState.tiles[createTileId(battlefieldPosition)];

  if (!battlefieldTile) {
    return <div className={styles.hexTile} title="Empty Tile" />;
  }

  const imageSrc = imageMap[battlefieldTile.landType.imageName];
  const altText = battlefieldTile.landType.name;

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
        title={`${battlefieldTile.landType.name} (${battlefieldTile.landType.alignment})`}
        onContextMenu={handleRightClick}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={altText} className={styles.hexTileImg} />
        ) : (
          <p>no image</p>
        )}
      </div>
      {showPopup && (
        <LandCharacteristicsPopup
          battlefieldPosition={battlefieldPosition}
          gameState={gameState}
          screenPosition={popupPosition}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default HexTile;
