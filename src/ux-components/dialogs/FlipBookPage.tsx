import React from 'react';
import { toRoman } from '../../map/utils/romanNumerals';
import './css/FlipBook.css';

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
    },
    ref
  ) => {
    const isEvenPage = pageNum % 2 === 1;
    const defaultClassName = isEvenPage ? 'evenPage' : 'oddPage';
    const finalClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

    const romanPageNum = toRoman(1027 + pageNum);

    return (
      <div className={`pageStyle ${finalClassName}`} ref={ref} style={style}>
        {children || (
          <>
            <div className="caption">{header}</div>
            <img
              src={iconPath}
              alt={header}
              className="icon"
              onError={(e) => {
                // Fallback to a placeholder or hide an image on error
                e.currentTarget.style.display = 'none';
              }}
              // onClick={handleConstruct}
            />
            <div className="description">
              <h4 style={{ margin: '0 0 8px 0', color: '#2c1810', fontSize: '1rem' }}>
                Description:
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{description}</p>
              <br />
              <div className="costSection">
                <h4 style={{ margin: '0 0 5px 0', color: '#5d4037', fontSize: '1rem' }}>
                  {costLabel}: <span className="costValue">{cost}</span>
                </h4>
              </div>
              {maintainCost && (
                <div className="costSection">
                  <h4 style={{ margin: '0 0 5px 0', color: '#5d4037', fontSize: '1rem' }}>
                    Maintain Cost: <span className="costValue">{maintainCost}</span>
                  </h4>
                </div>
              )}
            </div>
            <h4 style={{ margin: '0 0 5px 0', color: '#5d4037', fontSize: '1rem' }}>
              - {romanPageNum} -
            </h4>
          </>
        )}
      </div>
    );
  }
);

export default FlipBookPage;
