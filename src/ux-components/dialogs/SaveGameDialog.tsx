import React, { useState } from 'react';
import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import SaveGameActionButton from '../buttons/SaveGameActionButton';
import CancelButton from '../buttons/CancelButton';

export interface SaveGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saveName: string) => void;
}

const SaveGameDialog: React.FC<SaveGameDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [saveName, setSaveName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (saveName.trim()) {
      onSave(saveName.trim());
      onClose();
      setSaveName('');
    } else {
      alert('Please enter a save name');
    }
  };

  const handleCancel = () => {
    onClose();
    setSaveName('');
  };

  // Center the dialog on screen (assuming 1920x1080 viewport)
  const dialogWidth = 730;
  const dialogHeight = 500;
  const x = (window.innerWidth - dialogWidth) / 2;
  const y = (window.innerHeight - dialogHeight) / 2;

  return (
    <FantasyBorderFrame
      screenPosition={{ x, y }}
      windowDimensions={{ width: dialogWidth, height: dialogHeight }}
      primaryButton={<SaveGameActionButton onClick={handleSave} />}
      secondaryButton={<CancelButton onClick={handleCancel} />}
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
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
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
  );
};

export default SaveGameDialog;
