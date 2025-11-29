import {useState} from 'react';
import {describe, it, afterEach, expect} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomPeekCard from
  '../../components/AddBathroom/AddBathroomPeekCard';
import AddBathroomPage from '../../components/AddBathroom/AddBathroomForm';

/**
 * @returns {object} peekcard + page
 */
function PeekCardPageWrapper() {
  const [cardOpen, setCardOpen] = useState(true);
  const [pageOpen, setPageOpen] = useState(false);

  return (
    <>
      <AddBathroomPeekCard
        showPeekCard={cardOpen}
        onExpand={() => {
          setCardOpen(false);
          setPageOpen(true);
        }}
      />
      <AddBathroomPage
        open={pageOpen}
        position={{lat: 1, lng: 1}}
        name={''}
        description={''}
        onClose={() => {}}
        onOpen={() => {}}
        onCreated={() => {}}
        onNameChange={() => {}}
        onDescriptionChange={() => {}}
      />
    </>
  );
}

afterEach(() => {
  cleanup();
});

describe('AddBathroomPeekCard', () => {
  it('renders when showPeekCard is true', () => {
    render(<AddBathroomPeekCard showPeekCard={true} onExpand={() => {}} />);

    screen.getByText('New Bathroom');
  });

  it('does not render when showPeekCard is false', () => {
    render(<AddBathroomPeekCard showPeekCard={false} onExpand={() => {}} />);

    expect(screen.queryByText('New Bathroom')).toBeNull();
  });

  it('shows add bathroom form when dragged upward enough on desktop', () => {
    render(<PeekCardPageWrapper/>);

    const card = screen.getByLabelText('Expand drawer by dragging');

    // mouse drag up
    fireEvent.mouseDown(card, {clientY: 200});
    fireEvent.mouseUp(window, {clientY: 100});

    screen.getByText('Bathroom Name');
  });

  it('does not show add bathroom form on small drag on desktop', () => {
    render(<PeekCardPageWrapper/>);

    const card = screen.getByLabelText('Expand drawer by dragging');

    // mouse drag up
    fireEvent.mouseDown(card, {clientY: 200});
    fireEvent.mouseUp(window, {clientY: 190});

    expect(screen.queryByText('Bathroom Name')).toBeNull();
  });

  it('shows add bathroom form when dragged upward enough on mobile', () => {
    render(<PeekCardPageWrapper/>);

    const card = screen.getByLabelText('Expand drawer by dragging');

    // drag up
    fireEvent.touchStart(card, {touches: [{clientY: 200}]});
    fireEvent.touchEnd(card, {changedTouches: [{clientY: 100}]});

    screen.getByText('Bathroom Name');
  });

  it('does not show add bathroom form on small drag on mobile', () => {
    render(<PeekCardPageWrapper/>);

    const card = screen.getByLabelText('Expand drawer by dragging');

    // drag up
    fireEvent.touchStart(card, {touches: [{clientY: 200}]});
    fireEvent.touchEnd(card, {changedTouches: [{clientY: 190}]});

    expect(screen.queryByText('Bathroom Name')).toBeNull();
  });
});
