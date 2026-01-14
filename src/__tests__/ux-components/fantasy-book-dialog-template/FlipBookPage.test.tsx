import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { FlipBookPageProps, Slot } from '../../../ux-components/fantasy-book-dialog-template/FlipBookPage';
import FlipBookPage, { FlipBookPageTypeName } from '../../../ux-components/fantasy-book-dialog-template/FlipBookPage';

// Mock CSS modules
jest.mock('../../../ux-components/fantasy-book-dialog-template/css/FlipBookPage.module.css', () => ({
  pageStyle: 'pageStyle',
  evenPage: 'evenPage',
  oddPage: 'oddPage',
  caption: 'caption',
  imageSlotContainer: 'imageSlotContainer',
  icon: 'icon',
  slotsContainer: 'slotsContainer',
  slotsScrollable: 'slotsScrollable',
  slotsVisible: 'slotsVisible',
  slot: 'slot',
  description: 'description',
  descriptionTitle: 'descriptionTitle',
  descriptionText: 'descriptionText',
  descriptionTextExpanded: 'descriptionTextExpanded',
  costSection: 'costSection',
  costTitle: 'costTitle',
  costValue: 'costValue',
  pageNumber: 'pageNumber',
}));

// Mock romanNumerals utility
jest.mock('../../../utils/romanNumerals', () => ({
  toRoman: (num: number) => {
    const lookup: { [key: number]: string } = {
      1: 'I',
      2: 'II',
      3: 'III',
      4: 'IV',
      5: 'V',
      6: 'VI',
      7: 'VII',
      8: 'VIII',
      9: 'IX',
      10: 'X',
    };
    return lookup[num] || num.toString();
  },
}));

describe('FlipBookPage Component', () => {
  const defaultProps: FlipBookPageProps = {
    pageNum: 1,
    lorePage: 0,
    header: 'Test Header',
    iconPath: '/test-icon.png',
    description: 'Test description',
    cost: 100,
    onIconClick: jest.fn(),
  };

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<FlipBookPage {...defaultProps} />);

      expect(screen.getByText('Test Header')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should render header text', () => {
      render(<FlipBookPage {...defaultProps} header="Fireball Spell" />);
      expect(screen.getByText('Fireball Spell')).toBeInTheDocument();
    });

    it('should render description', () => {
      render(<FlipBookPage {...defaultProps} description="A powerful fire spell that deals damage" />);
      expect(screen.getByText('A powerful fire spell that deals damage')).toBeInTheDocument();
    });

    it('should render icon image', () => {
      render(<FlipBookPage {...defaultProps} iconPath="/fireball.png" />);
      const icon = screen.getByAltText('Test Header');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', '/fireball.png');
    });
  });

  describe('Page Styling', () => {
    it('should apply even page class for odd pageNum', () => {
      render(<FlipBookPage {...defaultProps} pageNum={1} />);
      const page = screen.getByTestId('flipbook-page-' + defaultProps.header);
      expect(page).toHaveClass('evenPage');
    });

    it('should apply odd page class for even pageNum', () => {
      render(<FlipBookPage {...defaultProps} pageNum={2} />);
      const page = screen.getByTestId('flipbook-page-' + defaultProps.header);
      expect(page).toHaveClass('oddPage');
    });

    it('should apply custom className along with default', () => {
      render(<FlipBookPage {...defaultProps} className="custom-class" pageNum={1} />);
      const page = screen.getByTestId('flipbook-page-' + defaultProps.header);
      expect(page).toHaveClass('evenPage');
      expect(page).toHaveClass('custom-class');
    });

    it('should apply custom style prop', () => {
      render(<FlipBookPage {...defaultProps} style={{ backgroundColor: 'red' }} />);
      const page = screen.getByTestId('flipbook-page-' + defaultProps.header);
      expect(page).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('Cost Display', () => {
    it('should display cost with default label', () => {
      render(<FlipBookPage {...defaultProps} cost={150} />);
      expect(screen.getByText('Cost:')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should display cost with custom label', () => {
      render(<FlipBookPage {...defaultProps} cost={200} costLabel="Price" />);
      expect(screen.getByText('Price:')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('should display maintain cost', () => {
      render(<FlipBookPage {...defaultProps} maintainCost={50} />);
      expect(screen.getByText('Maintain Cost:')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should display both cost and maintain cost', () => {
      render(<FlipBookPage {...defaultProps} cost={100} maintainCost={25} />);
      expect(screen.getByText('Cost:')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Maintain Cost:')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should handle zero cost', () => {
      render(<FlipBookPage {...defaultProps} cost={0} />);
      expect(screen.getByText('Cost:')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle zero maintain cost', () => {
      render(<FlipBookPage {...defaultProps} maintainCost={0} />);
      expect(screen.getByText('Maintain Cost:')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should not display cost when undefined', () => {
      render(<FlipBookPage {...defaultProps} cost={undefined} />);
      expect(screen.queryByText('Cost:')).not.toBeInTheDocument();
    });

    it('should not display negative cost', () => {
      render(<FlipBookPage {...defaultProps} cost={-10} />);
      expect(screen.queryByText('Cost:')).not.toBeInTheDocument();
    });
  });

  describe('Page Number', () => {
    it('should display page number in Roman numerals', () => {
      render(<FlipBookPage {...defaultProps} pageNum={1} lorePage={0} />);
      expect(screen.getByText('- I -')).toBeInTheDocument();
    });

    it('should calculate page number correctly with lorePage offset', () => {
      render(<FlipBookPage {...defaultProps} pageNum={3} lorePage={5} />);
      expect(screen.getByText('- VIII -')).toBeInTheDocument();
    });

    it('should handle different page numbers', () => {
      const { rerender } = render(<FlipBookPage {...defaultProps} pageNum={1} lorePage={0} />);
      expect(screen.getByText('- I -')).toBeInTheDocument();

      rerender(<FlipBookPage {...defaultProps} pageNum={2} lorePage={0} />);
      expect(screen.getByText('- II -')).toBeInTheDocument();

      rerender(<FlipBookPage {...defaultProps} pageNum={5} lorePage={0} />);
      expect(screen.getByText('- V -')).toBeInTheDocument();
    });
  });

  describe('Slots Functionality', () => {
    const slots: Slot[] = [
      { id: 'slot1', name: 'Slot 1' },
      { id: 'slot2', name: 'Slot 2' },
      { id: 'slot3', name: 'Slot 3' },
    ];

    it('should render slots when provided', () => {
      const onSlotClick = jest.fn();
      render(<FlipBookPage {...defaultProps} slots={slots} onSlotClick={onSlotClick} />);

      expect(screen.getByText('Slot 1')).toBeInTheDocument();
      expect(screen.getByText('Slot 2')).toBeInTheDocument();
      expect(screen.getByText('Slot 3')).toBeInTheDocument();
    });

    it('should call onSlotClick when slot is clicked', () => {
      const onSlotClick = jest.fn();
      render(<FlipBookPage {...defaultProps} slots={slots} onSlotClick={onSlotClick} />);

      fireEvent.click(screen.getByText('Slot 1'));
      expect(onSlotClick).toHaveBeenCalledWith(slots[0]);
    });

    it('should filter out used slots', () => {
      const onSlotClick = jest.fn();
      const usedSlots = new Set(['slot2']);
      render(<FlipBookPage {...defaultProps} slots={slots} onSlotClick={onSlotClick} usedSlots={usedSlots} />);

      expect(screen.getByText('Slot 1')).toBeInTheDocument();
      expect(screen.queryByText('Slot 2')).not.toBeInTheDocument();
      expect(screen.getByText('Slot 3')).toBeInTheDocument();
    });

    it('should not render slots container when onSlotClick is not provided', () => {
      render(<FlipBookPage {...defaultProps} slots={slots} />);

      expect(screen.queryByText('Slot 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Slot 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Slot 3')).not.toBeInTheDocument();
    });

    it('should not render slots when slots array is empty', () => {
      const onSlotClick = jest.fn();
      render(<FlipBookPage {...defaultProps} slots={[]} onSlotClick={onSlotClick} />);
      const slotsContainer = screen.queryByTestId('flipbook-slots');
      expect(slotsContainer).not.toBeInTheDocument();
    });

    it('should apply scrollable class when more than 3 slots', () => {
      const manySlots: Slot[] = [
        { id: 'slot1', name: 'Slot 1' },
        { id: 'slot2', name: 'Slot 2' },
        { id: 'slot3', name: 'Slot 3' },
        { id: 'slot4', name: 'Slot 4' },
      ];
      const onSlotClick = jest.fn();
      render(<FlipBookPage {...defaultProps} slots={manySlots} onSlotClick={onSlotClick} />);

      const slotsContainer = screen.getByTestId('flipbook-slots');
      expect(slotsContainer).toHaveClass('slotsScrollable');
    });

    it('should apply visible class when 3 or fewer slots', () => {
      const onSlotClick = jest.fn();
      render(<FlipBookPage {...defaultProps} slots={slots} onSlotClick={onSlotClick} />);

      const slotsContainer = screen.getByTestId('flipbook-slots');
      expect(slotsContainer).toHaveClass('slotsVisible');
    });
  });

  describe('Auto-close on all slots used', () => {
    const slots: Slot[] = [
      { id: 'slot1', name: 'Slot 1' },
      { id: 'slot2', name: 'Slot 2' },
    ];

    it('should call onClose when all slots are used', async () => {
      const onClose = jest.fn();
      const usedSlots = new Set(['slot1', 'slot2']);

      render(
        <FlipBookPage {...defaultProps} slots={slots} onSlotClick={jest.fn()} usedSlots={usedSlots} onClose={onClose} />
      );

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should not call onClose when not all slots are used', async () => {
      const onClose = jest.fn();
      const usedSlots = new Set(['slot1']);

      render(
        <FlipBookPage {...defaultProps} slots={slots} onSlotClick={jest.fn()} usedSlots={usedSlots} onClose={onClose} />
      );

      await waitFor(() => {
        expect(onClose).not.toHaveBeenCalled();
      });
    });

    it('should not call onClose when no slots are provided', () => {
      const onClose = jest.fn();

      render(<FlipBookPage {...defaultProps} onClose={onClose} />);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Icon Click Handler', () => {
    it('should call onIconClick when icon is clicked', () => {
      const onIconClick = jest.fn();
      const slots: Slot[] = [
        { id: 'slot1', name: 'Slot 1' },
        { id: 'slot2', name: 'Slot 2' },
      ];
      render(<FlipBookPage {...defaultProps} onIconClick={onIconClick} slots={slots} />);

      const icon = screen.getByAltText('Test Header');
      fireEvent.click(icon);

      expect(onIconClick).toHaveBeenCalledTimes(1);
      expect(onIconClick).toHaveBeenCalledWith(slots);
    });

    it('should not throw error when icon is clicked without onIconClick', () => {
      render(<FlipBookPage {...defaultProps} />);

      const icon = screen.getByAltText('Test Header');
      expect(() => fireEvent.click(icon)).not.toThrow();
    });

    it('should apply hover effects on icon', () => {
      render(<FlipBookPage {...defaultProps} />);

      const icon = screen.getByAltText('Test Header') as HTMLImageElement;

      // Test mouse enter
      fireEvent.mouseEnter(icon);
      expect(icon.style.filter).toBe('brightness(1.2) drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))');
      expect(icon.style.transform).toBe('scale(1.05)');

      // Test mouse leave
      fireEvent.mouseLeave(icon);
      expect(icon.style.filter).toBe('brightness(1)');
      expect(icon.style.transform).toBe('scale(1)');
    });

    it('should hide icon on error', () => {
      render(<FlipBookPage {...defaultProps} />);

      const icon = screen.getByAltText('Test Header') as HTMLImageElement;
      fireEvent.error(icon);

      expect(icon.style.display).toBe('none');
    });
  });

  describe('Custom Children', () => {
    it('should render custom children instead of default content', () => {
      render(
        <FlipBookPage {...defaultProps}>
          <div>Custom Content</div>
        </FlipBookPage>
      );

      expect(screen.getByText('Custom Content')).toBeInTheDocument();
      expect(screen.queryByText('Test Header')).not.toBeInTheDocument();
    });

    it('should not render default layout when children are provided', () => {
      render(
        <FlipBookPage {...defaultProps}>
          <div>Custom Content</div>
        </FlipBookPage>
      );

      expect(screen.queryByText('Description:')).not.toBeInTheDocument();
      expect(screen.queryByText('Cost:')).not.toBeInTheDocument();
    });
  });

  describe('Forward Ref', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<FlipBookPage {...defaultProps} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveClass('pageStyle');
    });
  });

  describe('Edge Cases', () => {
    it('should render without optional props', () => {
      render(<FlipBookPage pageNum={1} lorePage={0} />);

      // Should render page number at minimum
      expect(screen.getByText('- I -')).toBeInTheDocument();
    });

    it('should handle empty description', () => {
      render(<FlipBookPage {...defaultProps} description="" />);
      expect(screen.getByText('Description:')).toBeInTheDocument();
    });

    it('should handle undefined usedSlots', () => {
      const slots: Slot[] = [{ id: 'slot1', name: 'Slot 1' }];
      const onSlotClick = jest.fn();

      render(<FlipBookPage {...defaultProps} slots={slots} onSlotClick={onSlotClick} />);

      expect(screen.getByText('Slot 1')).toBeInTheDocument();
    });

    it('should apply descriptionTextExpanded class when maintainCost is null', () => {
      render(<FlipBookPage {...defaultProps} maintainCost={undefined} />);
      const descriptionText = screen.getByTestId('flipbook-description-text');
      expect(descriptionText).toHaveClass('descriptionTextExpanded');
    });

    it('should apply descriptionText class when maintainCost is provided', () => {
      render(<FlipBookPage {...defaultProps} maintainCost={50} />);
      const descriptionText = screen.getByTestId('flipbook-description-text');
      expect(descriptionText).toHaveClass('descriptionText');
    });
  });

  describe('FlipBookPageType enum', () => {
    it('should export FlipBookPageType enum with correct values', () => {
      expect(FlipBookPageTypeName.SPELL).toBe('Spell');
      expect(FlipBookPageTypeName.BUILDING).toBe('Building');
      expect(FlipBookPageTypeName.RECRUIT).toBe('Recruit');
      expect(FlipBookPageTypeName.QUEST).toBe('Quest');
    });
  });
});
