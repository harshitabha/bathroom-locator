import {useState} from 'react';
import {describe, it, afterEach, expect} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomButton from '../components/AddBathroomButton';
import AddBathroomBanner from '../components/AddBathroomBanner';

/**
 * @returns {object} button + banner
 */
function ButtonBannerWrapper() {
  const [bannerOpen, setBannerOpen] = useState(false);
  return (
    <>
      <AddBathroomBanner bannerOpen={bannerOpen} onCancel={() => {}}/>
      <AddBathroomButton onClick={() => setBannerOpen(true)} />
    </>
  );
}

afterEach(() => {
  cleanup();
});

describe('AddBathroomButton', () => {
  it('renders the button', () => {
    render(<AddBathroomButton onClick={() => {}} />);

    screen.getByLabelText('Add a bathroom');
  });

  it('no banner when not pressed', () => {
    render(<ButtonBannerWrapper />);

    expect(screen.queryByText('Choose a location for the bathroom')).toBeNull();
  });

  it('opens banner when pressed', () => {
    render(<ButtonBannerWrapper />);

    fireEvent.click(screen.getByLabelText('Add a bathroom'));
    screen.getByText('Choose a location for the bathroom');
  });
});
