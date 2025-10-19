import React from 'react';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import GameButton from '../buttons/GameButton';
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
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>Save Game</h2>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="saveName"
              style={{ display: 'block', marginBottom: '10px', fontSize: '18px' }}
            >
              Enter save name:
            </label>
            <input
              id="saveName"
              type="text"
              value={saveGameName}
              onChange={(e) => setSaveGameName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              style={{
                width: '300px',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '2px solid #8B4513',
                backgroundColor: '#2F2F2F',
                color: 'white',
              }}
              placeholder="My Game Save"
              autoFocus
            />
          </div>
          <div style={{ fontSize: '14px', color: '#CCCCCC', marginTop: '20px' }}>
            Your game progress will be saved and can be loaded later.
          </div>
        </div>
      </FantasyBorderFrame>
    </div>
  );
};

export default SaveGameDialog;
