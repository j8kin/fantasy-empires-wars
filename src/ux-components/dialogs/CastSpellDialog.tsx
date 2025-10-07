import React from 'react';
import FlipBook from './FlipBook';
import FlipBookPage from './FlipBookPage';

export interface CastSpellDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CastSpellDialog: React.FC<CastSpellDialogProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <FlipBook width={333} height={429} maxWidth={860}>
      <FlipBookPage pageNum={0} />
      <FlipBookPage pageNum={1} />
      <FlipBookPage pageNum={2} />
      <FlipBookPage pageNum={3} />
    </FlipBook>
  );
};

export default CastSpellDialog;
