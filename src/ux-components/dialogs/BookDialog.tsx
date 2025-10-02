import React, { ReactNode } from 'react';
import HTMLFlipBook from 'react-pageflip';
import styles from './css/BookDialog.module.css';
import openedBook from '../../assets/book/opened-book.png';

export interface BookPageContent {
  content: ReactNode;
  pageNumber?: string;
}

export interface BookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pages: BookPageContent[];
}

const BookDialog: React.FC<BookDialogProps> = ({ isOpen, onClose, pages }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.bookContainer}>
        <div className={styles.bookWrapper}>
          <img src={openedBook} alt="Open Book" className={styles.bookBackground} />

          <HTMLFlipBook
            width={350}
            height={450}
            size="fixed"
            minWidth={250}
            maxWidth={350}
            minHeight={350}
            maxHeight={350}
            maxShadowOpacity={0.2}
            showCover={false}
            mobileScrollSupport={false}
            className={styles.flipBook}
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={600}
            usePortrait={true}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {pages.map((page, index) => (
              <div key={index} className={styles.page}>
                <div className={styles.pageContent}>{page.content}</div>
                {page.pageNumber && <div className={styles.pageNumber}>{page.pageNumber}</div>}
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>
    </div>
  );
};

export default BookDialog;
