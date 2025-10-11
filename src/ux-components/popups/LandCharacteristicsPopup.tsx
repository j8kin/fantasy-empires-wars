import React from 'react';
import { getAlignmentColor } from '../../types/Alignment';
import { createTileId, getPlayerById } from '../../types/GameState';
import styles from '../battlefield/css/LandCharacteristicsPopup.module.css';
import { NO_PLAYER } from '../../types/GamePlayer';
import { Position } from '../../map/utils/mapTypes';
import PopupWrapper, { PopupProps } from './PopupWrapper';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameState } from '../../contexts/GameContext';

interface LandCharacteristicsPopupProps extends PopupProps {
  battlefieldPosition: Position;
}

const LandCharacteristicsPopup: React.FC<LandCharacteristicsPopupProps> = ({
  battlefieldPosition,
  screenPosition,
}) => {
  const { hideLandPopup } = useApplicationContext();
  const { gameState } = useGameState();
  const battlefieldTile = gameState!.battlefieldLands[createTileId(battlefieldPosition)];
  const displayLandType = battlefieldTile.land;
  if (!displayLandType) return null;

  // Calculate dynamic size based on content type
  // MANUAL ADJUSTMENT POINT 1: Base heights and row spacing
  const headerHeight = 33; // Header with title (6px padding * 2 + 20px content)
  const baseContentPadding = 15; // Top and bottom padding for characteristics (8px * 2)
  const standardRowHeight = 21; // Height per standard data row (12px font + 6px margin)
  const buildingRowHeight = 24; // Height for building rows (includes building chip padding + gaps)
  const armyRowHeight = 18; // Height for army row (standard)

  // Calculate height for each content type separately
  let totalContentHeight = 0;

  // Standard rows: Alignment, Position, Gold per Turn, Controlled By
  totalContentHeight += 4 * standardRowHeight;

  // Buildings row - accounts for building chips and their styling
  if (battlefieldTile?.buildings && battlefieldTile.buildings.length > 0) {
    const buildingChipHeight = 16; // 10px font + 2px padding * 2 + 2px gap
    const buildingRows = Math.ceil(battlefieldTile.buildings.length / 3); // Estimate wrapping
    totalContentHeight += buildingRowHeight + (buildingRows - 1) * buildingChipHeight;
  }

  // Army rows - separate heroes and units
  if (battlefieldTile?.army && battlefieldTile.army.length > 0) {
    const heroes = battlefieldTile.army.filter(({ unit }) => unit.hero);
    const units = battlefieldTile.army.filter(({ unit }) => !unit.hero);

    if (heroes.length > 0) {
      const heroRows = Math.ceil(heroes.length / 3); // Estimate wrapping
      totalContentHeight += buildingRowHeight + (heroRows - 1) * armyRowHeight;
    }

    if (units.length > 0) {
      const unitRows = Math.ceil(units.length / 2); // Units might wrap less efficiently
      totalContentHeight += buildingRowHeight + (unitRows - 1) * armyRowHeight;
    }
  }

  // MANUAL ADJUSTMENT POINT 2: Final height calculation
  const calculatedHeight = headerHeight + baseContentPadding + totalContentHeight;
  const dynamicHeight = Math.min(calculatedHeight, 270); // MANUAL ADJUSTMENT POINT 3: Max height limit
  const dynamicWidth = 320;

  return (
    <PopupWrapper
      screenPosition={{ x: screenPosition.x + 10, y: screenPosition.y + 10 }}
      dimensions={{ width: dynamicWidth, height: dynamicHeight + 30 }}
      onClose={hideLandPopup}
    >
      <div className={styles.popupContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{displayLandType.id}</h3>
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
                    const player = getPlayerById(gameState, battlefieldTile.controlledBy);
                    return player ? player.name : NO_PLAYER.name;
                  })()}
                </span>
              </div>

              {battlefieldTile.buildings && battlefieldTile.buildings.length > 0 && (
                <div className={styles.row}>
                  <span className={styles.label}>Buildings:</span>
                  <div className={styles.buildingsList}>
                    {battlefieldTile.buildings.map((building, index) => (
                      <span key={index} className={styles.building}>
                        {building.id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {battlefieldTile.army && battlefieldTile.army.length > 0 && (
                <>
                  {battlefieldTile.army.some(({ unit }) => unit.hero) && (
                    <div className={styles.row}>
                      <span className={styles.label}>Heroes:</span>
                      <div className={styles.buildingsList}>
                        {battlefieldTile.army
                          .filter(({ unit }) => unit.hero)
                          .map(({ unit }, index) => (
                            <span key={index} className={styles.building}>
                              {unit.name} lvl: {unit.level}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {battlefieldTile.army.some(({ unit }) => !unit.hero) && (
                    <div className={styles.row}>
                      <span className={styles.label}>Units:</span>
                      <div className={styles.buildingsList}>
                        {battlefieldTile.army
                          .filter(({ unit }) => !unit.hero)
                          .map(({ unit, count }, index) => (
                            <span key={index} className={styles.value}>
                              {unit.name} ({count})
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </PopupWrapper>
  );
};

export default LandCharacteristicsPopup;
