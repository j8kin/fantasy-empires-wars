import React from 'react';
import styles from './css/SaveGameDialog.module.css';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import GameButton from '../buttons/GameButton';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import { ButtonName } from '../../types/ButtonName';

const SaveGameDialog: React.FC = () => {
  const { showSaveDialog, setShowSaveDialog, saveGameName, setSaveGameName, resetSaveGameDialog } =
    useApplicationContext();

  if (!showSaveDialog) return null;

  const handleSave = () => {
    if (saveGameName.trim()) {
      console.log('Saving game with name:', saveGameName.trim());
      // TODO: Implement actual save game functionality
      setShowSaveDialog(false);
      resetSaveGameDialog();
    } else {
      alert('Please enter a save name');
    }
  };

  const handleCancel = () => {
    setShowSaveDialog(false);
    resetSaveGameDialog();
  };

  // Center the dialog on screen (assuming 1920x1080 viewport)
  const dialogWidth = 730;
  const dialogHeight = 500;
  const x = (window.innerWidth - dialogWidth) / 2;
  const y = (window.innerHeight - dialogHeight) / 2;

  return (
    <div data-testid="SaveGameDialog">
      <FantasyBorderFrame
        screenPosition={{ x, y }}
        frameSize={{ width: dialogWidth, height: dialogHeight }}
        primaryButton={<GameButton buttonName={ButtonName.SAVE} onClick={handleSave} />}
        secondaryButton={<GameButton buttonName={ButtonName.CANCEL} onClick={handleCancel} />}
      >
        <div className={styles.container}>
          <h2 className={styles.title}>Save Game</h2>
          <div className={styles.inputSection}>
            <label htmlFor="saveName" className={styles.inputLabel}>
              Enter save name:
            </label>
            <input
              id="saveName"
              type="text"
              value={saveGameName}
              onChange={(e) => setSaveGameName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              className={styles.saveInput}
              placeholder="My Game Save"
              autoFocus
            />
          </div>
          <div className={styles.helperText}>Your game progress will be saved and can be loaded later.</div>
        </div>
      </FantasyBorderFrame>
    </div>
  );
};

export default SaveGameDialog;
