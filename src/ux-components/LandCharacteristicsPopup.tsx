import React, { useEffect, useRef } from 'react';
import { LandType } from '../types/LandType';
import { HexTileState } from '../types/HexTileState';
import styles from './css/LandCharacteristicsPopup.module.css';

interface LandCharacteristicsPopupProps {
  landType?: LandType;
  tileState?: HexTileState;
  position: { x: number; y: number };
  onClose: () => void;
}

const LandCharacteristicsPopup: React.FC<LandCharacteristicsPopupProps> = ({
  landType,
  tileState,
  position,
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

  const displayLandType = tileState?.landType || landType;
  if (!displayLandType) return null;

  return (
    <div
      ref={popupRef}
      className={styles.popup}
      style={{
        left: position.x + 10,
        top: position.y + 10,
      }}
    >
      <div className={styles.popupContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{displayLandType.name}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.characteristics}>
          <div className={styles.row}>
            <span className={styles.label}>Alignment:</span>
            <span className={styles.value}>{displayLandType.alignment}</span>
          </div>
          
          {tileState && (
            <>
              <div className={styles.row}>
                <span className={styles.label}>Position:</span>
                <span className={styles.value}>{tileState.row}, {tileState.col}</span>
              </div>
              
              <div className={styles.row}>
                <span className={styles.label}>Gold per Turn:</span>
                <span className={styles.value}>{tileState.goldPerTurn}</span>
              </div>
              
              <div className={styles.row}>
                <span className={styles.label}>Controlled By:</span>
                <span className={styles.value}>{tileState.controlledBy?.name || 'None'}</span>
              </div>
              
              {tileState.buildings && tileState.buildings.length > 0 && (
                <div className={styles.row}>
                  <span className={styles.label}>Buildings:</span>
                  <div className={styles.buildingsList}>
                    {tileState.buildings.map((building, index) => (
                      <span key={index} className={styles.building}>
                        {building.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {tileState.army && tileState.army.totalCount > 0 && (
                <div className={styles.row}>
                  <span className={styles.label}>Army:</span>
                  <span className={styles.value}>
                    {tileState.army.totalCount} units
                  </span>
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