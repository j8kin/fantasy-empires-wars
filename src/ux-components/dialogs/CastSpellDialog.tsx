import React from 'react';
import FlipBook from './FlipBook';
import FlipBookPage from './FlipBookPage';
import { WhiteMagicSpells } from '../../types/Spell';

export interface CastSpellDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CastSpellDialog: React.FC<CastSpellDialogProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <FlipBook width={333} height={429} maxWidth={860}>
      {WhiteMagicSpells.map((spell, index) => (
        <FlipBookPage
          key={spell.id}
          pageNum={index}
          header={spell.name}
          iconPath={spell.iconPath}
          description={spell.description}
          cost={spell.manaCost}
          costLabel="Mana Cost"
        />
      ))}
    </FlipBook>
  );
};

export default CastSpellDialog;
