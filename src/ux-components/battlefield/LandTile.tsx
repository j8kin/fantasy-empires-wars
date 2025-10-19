import React from 'react';
import styles from './css/Hexagonal.module.css';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import LandCharacteristicsPopup from '../popups/LandCharacteristicsPopup';

import { battlefieldLandId, getPlayerById } from '../../types/GameState';
import { LandPosition } from '../../map/utils/mapLands';

import { BuildingType, getBuilding } from '../../types/Building';
import { construct } from '../../map/building/construct';

import { getSpellById, SpellName } from '../../types/Spell';
import { castSpell } from '../../map/cast-spell/castSpell';

import { getLandImg } from '../../assets/getLandImg';

interface HexTileProps {
  battlefieldPosition: LandPosition;
}

const LandTile: React.FC<HexTileProps> = ({ battlefieldPosition }) => {
  const {
    landPopupPosition,
    landPopupScreenPosition,
    showLandPopup,
    glowingTiles,
    clearAllGlow,
    selectedLandAction,
    setSelectedLandAction,
  } = useApplicationContext();
  const { gameState, updateGameState, recalculateAllPlayersIncome } = useGameContext();

  const showPopup =
    landPopupPosition?.row === battlefieldPosition.row &&
    landPopupPosition?.col === battlefieldPosition.col;

  const battlefieldTile = gameState!.battlefield.lands[battlefieldLandId(battlefieldPosition)];

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

  const tileId = battlefieldLandId(battlefieldPosition);
  const isGlowing = glowingTiles.has(tileId) || battlefieldTile.glow;

  const handleClick = (event: React.MouseEvent) => {
    if (isGlowing) {
      event.preventDefault();
      event.stopPropagation(); // Prevent the battlefield click handler from firing

      if (selectedLandAction?.startsWith('Spell: ')) {
        const spellToCast = getSpellById(selectedLandAction?.substring(7) as SpellName);
        gameState!.selectedPlayer.mana![spellToCast.school] -= spellToCast.manaCost;
        // todo add animation for casting spell
        castSpell(spellToCast, battlefieldPosition, gameState!);

        updateGameState(gameState!);
        alert(`Cast ${spellToCast.id} on Land ${tileId}.`);
      } else if (selectedLandAction?.startsWith('Building: ')) {
        const buildingToConstruct = selectedLandAction?.substring(10) as BuildingType;
        if (gameState!.selectedPlayer.money! >= getBuilding(buildingToConstruct).buildCost) {
          // todo add animation for building
          construct(
            gameState!.selectedPlayer,
            buildingToConstruct,
            battlefieldPosition,
            gameState!
          );
          gameState!.selectedPlayer.money! -= getBuilding(buildingToConstruct).buildCost;
          updateGameState(gameState!);
          recalculateAllPlayersIncome();
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
        {imageSrc ? (
          <img src={imageSrc} alt={altText} className={styles.hexTileImg} />
        ) : (
          <p>no image</p>
        )}
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
