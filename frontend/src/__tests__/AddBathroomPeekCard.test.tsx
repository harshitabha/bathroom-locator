import {describe, it, afterEach, expect, vi} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomPeekCard from '../components/AddBathroomPeekCard';

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('AddBathroomPeekCard', () => {
  it('renders when showPeekCard is true', () => {
    render(
        <AddBathroomPeekCard
          showPeekCard={true}
          onExpand={() => {}}
        />,
    );

    expect(screen.getByText('New Bathroom')).toBeInTheDocument();
  });

  it('does not render when showPeekCard is false', () => {
    render(
        <AddBathroomPeekCard
          showPeekCard={false}
          onExpand={() => {}}
        />,
    );

    expect(screen.queryByText('New Bathroom')).not.toBeInTheDocument();
  });

  it('calls onExpand when dragged upward enough', () => {
    const onExpand = vi.fn();

    render(
        <AddBathroomPeekCard
          showPeekCard={true}
          onExpand={onExpand}
        />,
    );

    const card = screen.getByLabelText('Expand drawer by dragging');

    // mouse drag up
    fireEvent.mouseDown(card, {clientY: 200});
    fireEvent.mouseUp(window, {clientY: 100});

    expect(onExpand).toHaveBeenCalledTimes(1);
  });
});
