import {useState} from 'react';
import {describe, it, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomButton from '../components/AddBathroomButton';
import AddBathroomBanner from '../components/AddBathroomBanner';
import AppContext from '../context/AppContext';

/**
 * @param {object} root0 props
 * @param {string | null} root0.initUserId logged in/out
 * @returns {object} banner + button
 */
function ButtonBannerWrapper({initUserId}: {
  initUserId: string | null;
}) {
  const [bannerOpen, setBannerOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(initUserId);
  const getCurrentUserId = vi.fn().mockResolvedValue(userId);
  return (
    <AppContext value={{userId, setUserId, getCurrentUserId}}>
      <AddBathroomBanner bannerOpen={bannerOpen} onCancel={() => {}}/>
      {userId && <AddBathroomButton onClick={() => setBannerOpen(true)} />}
    </AppContext>
  );
}

// mock supabase
vi.mock('../lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChange: vi.fn(),
      },
    },
  };
});

afterEach(() => {
  cleanup();
});

describe('AddBathroomButton', () => {
  it('renders the button when logged in', () => {
    render(<ButtonBannerWrapper initUserId={'123'} />);

    screen.getByLabelText('Add a bathroom');
  });

  it('does not render the button when logged out', () => {
    render(<ButtonBannerWrapper initUserId={null} />);

    expect(screen.queryByLabelText('Add a bathroom')).toBeNull();
  });

  it('no banner when not pressed', () => {
    render(<ButtonBannerWrapper initUserId={'123'} />);

    expect(screen.queryByText('Choose a location for the bathroom')).toBeNull();
  });

  it('opens banner when pressed', () => {
    render(<ButtonBannerWrapper initUserId={'123'} />);

    fireEvent.click(screen.getByLabelText('Add a bathroom'));
    screen.getByText('Choose a location for the bathroom');
  });
});
