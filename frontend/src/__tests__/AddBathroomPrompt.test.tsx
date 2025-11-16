import AddBathroomPrompt from '../components/AddBathroomPrompt';
import {
  describe,
  it,
  afterEach,
  expect,
} from 'vitest';
import {
  render,
  screen,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/**
 * Renders the AddBathroomPrompt component
 * @param {object} [options] Optional render options
 * @param {boolean} [options.bannerOpen] Whether the banner is open
 * @param {boolean} [options.showPeekCard] Whether the peek card is shown
 * @returns {import('@testing-library/react').RenderResult} Library result
 */
function renderPrompt(options?: {
  bannerOpen?: boolean;
  showPeekCard?: boolean;
}) {
  const {
    bannerOpen = false,
    showPeekCard = false,
  } = options ?? {};

  return render(
      <AddBathroomPrompt
        bannerOpen={bannerOpen}
        showPeekCard={showPeekCard}
        onCancel={() => {}}
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

  it('does not render the banner when closed', () => {
    renderPrompt({bannerOpen: false});

    expect(
        screen.queryByText('Choose a location for the bathroom'),
    ).toBeNull();
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
