import React from 'react';
import './css/FlipBook.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameState } from '../../contexts/GameContext';

import { getSpellById, SpellName } from '../../types/Spell';
import { highlightLands } from '../../map/utils/highlightLands';
import { BuildingType } from '../../types/Building';
import { toRoman } from '../../map/utils/romanNumerals';

interface FlipBookPageProps {
  pageNum: number;
  header?: string;
  iconPath?: string;
  description?: string;
  cost?: number;
  costLabel?: string;
  maintainCost?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
}

const FlipBookPage = React.forwardRef<HTMLDivElement, FlipBookPageProps>(
  (
    {
      pageNum,
      header,
      iconPath,
      description,
      cost,
      costLabel = 'Cost',
      maintainCost,
      children,
      className,
      style,
      onClose,
    },
    ref
  ) => {
    const { setSelectedItem, addGlowingTile } = useApplicationContext();
    const { gameState } = useGameState();

    const isEvenPage = pageNum % 2 === 1;
    const defaultClassName = isEvenPage ? 'evenPage' : 'oddPage';
    const finalClassName = className ? `${defaultClassName} ${className}` : defaultClassName;
    const isSpellBook = costLabel === 'Mana Cost';

    const romanPageNum = toRoman(isSpellBook ? 1027 : 2351 + pageNum);

    const handleIconClick = () => {
      if (header) {
        setSelectedItem(isSpellBook ? 'Spell: ' : 'Building: ' + header);
        const actionType = isSpellBook ? 'spell' : 'building';
        const name = isSpellBook ? getSpellById(header as SpellName).id : (header as BuildingType);

        if (onClose) {
          onClose(); // close dialog to apply spell or construction
        }

        // Get the tile IDs that should be highlighted
        const landsToHighlight = highlightLands(gameState!, actionType, name);
        // Add tiles to the glowing tiles set for visual highlighting
        landsToHighlight.forEach((tileId) => {
          addGlowingTile(tileId);
        });
      }
    };

    return (
      <div className={`pageStyle ${finalClassName}`} ref={ref} style={style}>
        {children || (
          <>
            <div className="caption" style={{ textAlign: 'center' }}>
              {header}
            </div>
            <img
              src={iconPath}
              alt={header}
              className="icon clickable-icon"
              style={{
                alignSelf: isEvenPage ? 'flex-end' : 'flex-start',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                filter: 'brightness(1)',
              }}
              onClick={handleIconClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter =
                  'brightness(1.2) drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onError={(e) => {
                // Fallback to a placeholder or hide an image on error
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="description">
              <h4 style={{ margin: '0 0 8px 0', color: '#2c1810', fontSize: '1rem' }}>
                Description:
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  height: '2.8rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {description}
              </p>
              <br />
              <div className="costSection">
                <h4 style={{ margin: '0 0 5px 0', color: '#5d4037', fontSize: '1rem' }}>
                  {costLabel}: <span className="costValue">{cost}</span>
                </h4>
              </div>
              {!isSpellBook && (
                <div className="costSection">
                  <h4 style={{ margin: '0 0 5px 0', color: '#5d4037', fontSize: '1rem' }}>
                    Maintain Cost: <span className="costValue">{maintainCost}</span>
                  </h4>
                </div>
              )}
            </div>
            <h4
              style={{
                margin: '0 0 5px 0',
                color: '#5d4037',
                fontSize: '1rem',
                textAlign: 'center',
              }}
            >
              - {romanPageNum} -
            </h4>
          </>
        )}
      </div>
    );
  }
);

export default FlipBookPage;
