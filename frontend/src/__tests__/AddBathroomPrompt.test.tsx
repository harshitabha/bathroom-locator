import AddBathroomPrompt from '../components/AddBathroomPrompt';
import {
  describe,
  it,
  afterEach,
  expect,
  vi,
} from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/**
 * Renders the AddBathroomPrompt component
 * @param {object} [options] Optional render options
 * @param {boolean} [options.bannerOpen] Whether the banner is open
 * @param {boolean} [options.showPeekCard] Whether the peek card is shown
 * @param {() => void} [options.onCancel] Handler for the Cancel button
 * @returns {import('@testing-library/react').RenderResult} Library result
 */
function renderPrompt(options?: {
  bannerOpen?: boolean;
  showPeekCard?: boolean;
  onCancel?: () => void;
}) {
  const {
    bannerOpen = false,
    showPeekCard = false,
    onCancel = () => {},
  } = options ?? {};

  return render(
      <AddBathroomPrompt
        bannerOpen={bannerOpen}
        showPeekCard={showPeekCard}
        onCancel={onCancel}
        onPeekTouchStart={() => {}}
        onPeekTouchEnd={() => {}}
        onPeekMouseDown={() => {}}
      />,
  );
}

describe('AddBathroomPrompt component', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the banner message when open', () => {
    renderPrompt({bannerOpen: true});

    screen.getByText('Choose a location for the bathroom');
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    const onCancel = vi.fn();

    renderPrompt({bannerOpen: true, onCancel});

    const cancelButton = screen.getByRole('button', {name: 'Cancel'});
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows the peek card heading when enabled', () => {
    renderPrompt({showPeekCard: true});

    screen.getByText('New Bathroom');
  });

  it('does not render the peek card when disabled', () => {
    renderPrompt({showPeekCard: false});

    expect(
        screen.queryByText('New Bathroom'),
    ).toBeNull();
  });
});
