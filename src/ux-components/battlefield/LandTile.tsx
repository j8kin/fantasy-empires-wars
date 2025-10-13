import React from 'react';
import styles from './css/Hexagonal.module.css';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import LandCharacteristicsPopup from '../popups/LandCharacteristicsPopup';

import { battlefieldLandId, getPlayerById } from '../../types/GameState';
import { LandPosition } from '../../map/utils/mapLands';
import { BuildingType, getBuilding } from '../../types/Building';
import { construct } from '../../map/building/construct';

import { getLandImg } from '../../assets/getLandImg';

interface HexTileProps {
  battlefieldPosition: LandPosition;
  landHideModePlayerId?: string;
}

const LandTile: React.FC<HexTileProps> = ({ battlefieldPosition, landHideModePlayerId }) => {
  const {
    landPopupPosition,
    landPopupScreenPosition,
    showLandPopup,
    glowingTiles,
    clearAllGlow,
    selectedLandAction,
    setSelectedLandAction,
  } = useApplicationContext();
  const { gameState, updateGameState } = useGameContext();

  const showPopup =
    landPopupPosition?.row === battlefieldPosition.row &&
    landPopupPosition?.col === battlefieldPosition.col;

  const battlefieldTile = gameState!.battlefieldLands[battlefieldLandId(battlefieldPosition)];

  if (!battlefieldTile) {
    return <div className={styles.hexTile} title="Empty Tile" />;
  }

  const imageSrc = getLandImg(battlefieldTile.land.id);
  const altText = battlefieldTile.land.id;

  // Get the controlling player's color or default to white if not controlled
  const getBackgroundColor = (): string => {
    const controllingPlayer = getPlayerById(gameState, battlefieldTile.controlledBy);
    return controllingPlayer?.color ?? 'white';
  };

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    showLandPopup(battlefieldPosition, { x: event.clientX, y: event.clientY });
  };

  // Determine if land image should be hidden
  // Hide land images only for tiles controlled by the selected player (to show their territories clearly)
  // Uncontrolled tiles and other players' tiles should show normally
  const shouldHideLandImage =
    landHideModePlayerId && battlefieldTile.controlledBy === landHideModePlayerId;

  const tileId = battlefieldLandId(battlefieldPosition);
  const isGlowing = glowingTiles.has(tileId) || battlefieldTile.glow;

  const handleClick = (event: React.MouseEvent) => {
    if (isGlowing) {
      event.preventDefault();
      event.stopPropagation(); // Prevent the battlefield click handler from firing

      if (selectedLandAction?.startsWith('Spell: ')) {
        alert(
          `Perform action for Land ${tileId}. Selected item: ${JSON.stringify(selectedLandAction)}`
        );
      } else if (selectedLandAction?.startsWith('Building: ')) {
        const buildingToConstruct = selectedLandAction?.substring(10) as BuildingType;
        // todo add filter in ConstructBuildingDialog to prevent construction of buildings that are not available for the player
        if (gameState!.selectedPlayer.money! >= getBuilding(buildingToConstruct).buildCost) {
          // todo add animation for building
          construct(
            gameState!.selectedPlayer,
            buildingToConstruct,
            battlefieldPosition,
            gameState!.battlefieldLands,
            gameState!.mapSize
          );
          gameState!.selectedPlayer.money! -= getBuilding(buildingToConstruct).buildCost;
          updateGameState(gameState!);
        }
      } else {
        alert(
          `Unknown action for Land ${tileId}. Action item: ${JSON.stringify(selectedLandAction)}`
        );
      }
      clearAllGlow();
      setSelectedLandAction(null); // Clear selected item after action is performed
    }
  };

  const tileStyle: React.CSSProperties = {
    backgroundColor: getBackgroundColor(),
    filter: isGlowing
      ? 'brightness(1.3) drop-shadow(0 4px 12px rgba(255, 215, 0, 0.6))'
      : 'brightness(1) ',
    transform: isGlowing ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
    transition: 'all 0.3s ease',
    border: isGlowing ? '5px' : 'none',
    zIndex: isGlowing ? 10 : 1,
    position: 'relative',
  };

  return (
    <>
      <div
        className={styles.hexTile}
        title={`${battlefieldTile.land.id} (${battlefieldTile.land.alignment})`}
        onContextMenu={handleRightClick}
        onClick={handleClick}
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
          screenPosition={landPopupScreenPosition}
        />
      )}
    </>
  );
};

export default LandTile;
