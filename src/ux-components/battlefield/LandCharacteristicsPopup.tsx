import React, { useEffect, useRef } from 'react';
import { getAlignmentColor } from '../../types/Alignment';
import { createTileId, GameState, getPlayerById } from '../../types/HexTileState';
import styles from './css/LandCharacteristicsPopup.module.css';
import { NO_PLAYER } from '../../types/GamePlayer';
import { Position } from '../../map/utils/mapTypes';

interface LandCharacteristicsPopupProps {
  battlefieldPosition: Position;
  gameState: GameState;
  screenPosition: { x: number; y: number };
  onClose: () => void;
}

const LandCharacteristicsPopup: React.FC<LandCharacteristicsPopupProps> = ({
  battlefieldPosition,
  gameState,
  screenPosition,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const battlefieldTile = gameState.tiles[createTileId(battlefieldPosition)];
  const displayLandType = battlefieldTile.landType;
  if (!displayLandType) return null;

  return (
    <div
      ref={popupRef}
      className={styles.popup}
      style={{
        left: screenPosition.x + 10,
        top: screenPosition.y + 10,
      }}
    >
      <div className={styles.popupContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{displayLandType.name}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.characteristics}>
          <div className={styles.row}>
            <span className={styles.label}>Alignment:</span>
            <span
              className={styles.value}
              style={{ color: getAlignmentColor(displayLandType.alignment) }}
            >
              {displayLandType.alignment}
            </span>
          </div>

          {battlefieldTile && (
            <>
              <div className={styles.row}>
                <span className={styles.label}>Position:</span>
                <span className={styles.value}>
                  {battlefieldPosition.row}, {battlefieldPosition.col}
                </span>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>Gold per Turn:</span>
                <span className={styles.value}>{battlefieldTile.goldPerTurn}</span>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>Controlled By:</span>
                <span className={styles.value}>
                  {(() => {
                    if (battlefieldTile.controlledBy === NO_PLAYER.id) {
                      return 'None';
                    }
                    const player = getPlayerById(gameState, battlefieldTile.controlledBy);
                    return player ? player.name : battlefieldTile.controlledBy;
                  })()}
                </span>
              </div>

              {battlefieldTile.buildings && battlefieldTile.buildings.length > 0 && (
                <div className={styles.row}>
                  <span className={styles.label}>Buildings:</span>
                  <div className={styles.buildingsList}>
                    {battlefieldTile.buildings.map((building, index) => (
                      <span key={index} className={styles.building}>
                        {building.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {battlefieldTile.army && battlefieldTile.army.totalCount > 0 && (
                <div className={styles.row}>
                  <span className={styles.label}>Army:</span>
                  <span className={styles.value}>{battlefieldTile.army.totalCount} units</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandCharacteristicsPopup;
