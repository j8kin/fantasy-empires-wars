import React from 'react';

interface FlipBookPageProps {
  pageNum: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const FlipBookPage = React.forwardRef<HTMLDivElement, FlipBookPageProps>(
  ({ pageNum, children, className, style }, ref) => {
    const isEvenPage = pageNum % 2 === 1;
    const defaultClassName = isEvenPage ? 'evenPage' : 'oddPage';
    const finalClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

    return (
      <div className={`pageStyle ${finalClassName}`} ref={ref} style={style}>
        {children || (
          <>
            <h1>Page Header</h1>
            <p>Some text</p>
            <p>Page number: {pageNum}</p>
          </>
        )}
      </div>
    );
  }
);

export default FlipBookPage;
