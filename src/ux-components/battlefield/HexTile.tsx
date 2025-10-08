import React from 'react';
import styles from './css/Hexagonal.module.css';
import { createTileId, GameState, getPlayerById } from '../../types/HexTileState';
import LandCharacteristicsPopup from '../popups/LandCharacteristicsPopup';
import { Position } from '../../map/utils/mapTypes';
import { PLAYER_COLORS } from '../../types/PlayerColors';
import { useApplicationContext } from '../../contexts/ApplicationContext';

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
  landHideModePlayerId?: string;
}

const HexTile: React.FC<HexTileProps> = ({
  battlefieldPosition,
  gameState,
  landHideModePlayerId,
}) => {
  const { landPopupPosition, landPopupScreenPosition, showLandPopup, hideLandPopup } =
    useApplicationContext();

  const showPopup =
    landPopupPosition?.row === battlefieldPosition.row &&
    landPopupPosition?.col === battlefieldPosition.col;

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
  const altText = battlefieldTile.landType.id;

  // Get the controlling player's color or default to white if not controlled
  const getBackgroundColor = (): string => {
    if (!battlefieldTile.controlledBy) {
      return 'white';
    }
    const controllingPlayer = getPlayerById(gameState, battlefieldTile.controlledBy);
    if (!controllingPlayer) {
      return 'white';
    }
    const playerColor = PLAYER_COLORS.find((color) => color.name === controllingPlayer.color);
    return playerColor?.value ?? 'white';
  };

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    showLandPopup(battlefieldPosition, { x: event.clientX, y: event.clientY });
  };

  const handleClosePopup = () => {
    hideLandPopup();
  };

  // Determine if land image should be hidden
  // Hide land images only for tiles controlled by the selected player (to show their territories clearly)
  // Uncontrolled tiles and other players' tiles should show normally
  const shouldHideLandImage =
    landHideModePlayerId && battlefieldTile.controlledBy === landHideModePlayerId;

  // Create style object for the hex tile
  const tileStyle: React.CSSProperties = {
    backgroundColor: getBackgroundColor(),
  };

  return (
    <>
      <div
        className={styles.hexTile}
        title={`${battlefieldTile.landType.id} (${battlefieldTile.landType.alignment})`}
        onContextMenu={handleRightClick}
        style={tileStyle}
      >
        {!shouldHideLandImage && imageSrc ? (
          <img src={imageSrc} alt={altText} className={styles.hexTileImg} />
        ) : !shouldHideLandImage && !imageSrc ? (
          <p>no image</p>
        ) : null}
      </div>
      {showPopup && (
        <LandCharacteristicsPopup
          battlefieldPosition={battlefieldPosition}
          gameState={gameState}
          screenPosition={landPopupScreenPosition}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default HexTile;
