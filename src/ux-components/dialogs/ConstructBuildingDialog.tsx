import React from 'react';
import BookDialog, { BookPageContent } from './BookDialog';
import styles from './css/BookDialog.module.css';

export interface BuildingData {
  id: string;
  name: string;
  image: string;
  buildCost: {
    gold?: number;
    wood?: number;
    stone?: number;
    mana?: number;
  };
  maintainCost: {
    gold?: number;
    mana?: number;
  };
  description: string;
  requirements?: string[];
  effects?: string[];
}

export interface ConstructBuildingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingData | null;
  onConstruct?: (buildingId: string) => void;
  onCancel?: () => void;
}

// Sample building data - replace with actual game data
const sampleBuilding: BuildingData = {
  id: 'castle',
  name: 'Castle',
  image: '/path/to/castle-image.png',
  buildCost: {
    gold: 500,
    stone: 200,
    wood: 100,
  },
  maintainCost: {
    gold: 50,
  },
  description:
    'A mighty fortress that provides defense and serves as a stronghold for your empire. Increases population capacity and provides defensive bonuses.',
  requirements: ['Level 3 City', 'Stone Mason Guild'],
  effects: ['Defense +25', 'Population +100', 'Garrison +10'],
};

const ConstructBuildingDialog: React.FC<ConstructBuildingDialogProps> = ({
  isOpen,
  onClose,
  building = sampleBuilding,
  onConstruct,
  onCancel,
}) => {
  if (!building) return null;

  const handleConstruct = () => {
    if (onConstruct) {
      onConstruct(building.id);
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const formatCost = (cost: Record<string, number>) => {
    return Object.entries(cost).map(([resource, amount]) => (
      <div key={resource} className={styles.costItem}>
        <span className={styles.costLabel}>
          {resource.charAt(0).toUpperCase() + resource.slice(1)}:
        </span>
        <span className={styles.costValue}>{amount}</span>
      </div>
    ));
  };

  // Left page content - Building image and basic info
  const leftPageContent = (
    <>
      <img
        src={building.image}
        alt={building.name}
        className={styles.buildingImage}
        onError={(e) => {
          // Fallback to a placeholder or hide image on error
          e.currentTarget.style.display = 'none';
        }}
      />
      <div className={styles.buildingName}>{building.name}</div>

      <div className={styles.costSection}>
        <h4 style={{ margin: '0 0 10px 0', color: '#5d4037', fontSize: '1.1rem' }}>Build Cost:</h4>
        {formatCost(building.buildCost)}
      </div>

      {Object.keys(building.maintainCost).length > 0 && (
        <div className={styles.costSection}>
          <h4 style={{ margin: '0 0 10px 0', color: '#5d4037', fontSize: '1.1rem' }}>
            Maintain Cost:
          </h4>
          {formatCost(building.maintainCost)}
        </div>
      )}
    </>
  );

  // Right page content - Description and effects
  const rightPageContent = (
    <>
      <div className={styles.description}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2c1810' }}>Description:</h4>
        <p style={{ margin: 0 }}>{building.description}</p>
      </div>

      {building.requirements && building.requirements.length > 0 && (
        <div className={styles.description}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c1810' }}>Requirements:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {building.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {building.effects && building.effects.length > 0 && (
        <div className={styles.description}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c1810' }}>Effects:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {building.effects.map((effect, index) => (
              <li key={index}>{effect}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.actionButtons}>
        <button
          className={`${styles.actionButton} ${styles.confirmButton}`}
          onClick={handleConstruct}
        >
          Build
        </button>
        <button className={`${styles.actionButton} ${styles.cancelButton}`} onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </>
  );

  const pages: BookPageContent[] = [
    {
      content: leftPageContent,
      pageNumber: 'I',
    },
    {
      content: rightPageContent,
      pageNumber: 'II',
    },
  ];

  return <BookDialog isOpen={isOpen} onClose={onClose} pages={pages} title="Construction Plans" />;
};

export default ConstructBuildingDialog;
