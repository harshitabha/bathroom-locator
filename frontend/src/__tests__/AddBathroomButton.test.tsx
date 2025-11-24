import {useState} from 'react';
import {describe, it, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomButton from '../components/AddBathroomButton';
import AddBathroomBanner from '../components/AddBathroomBanner';
import {AuthContext} from '../providers/AuthProvider';
import type {User} from '@supabase/supabase-js';

/**
 * @param {object} root0 props
 * @param {User | null} root0.user logged in/out
 * @returns {object} banner + button
 */
function ButtonBannerWrapper({user}: {
  user: User | null;
}) {
  const [bannerOpen, setBannerOpen] = useState(false);
  return (
    <AuthContext.Provider
      value={{
        user,
        signOut: vi.fn(),
      }}
    >
      <AddBathroomBanner bannerOpen={bannerOpen} onCancel={() => {}}/>
      {user && <AddBathroomButton onClick={() => setBannerOpen(true)} />}
    </AuthContext.Provider>
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

const fakeUser: User = {
  id: '123',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  identities: [],
};

afterEach(() => {
  cleanup();
});

describe('AddBathroomButton', () => {
  it('renders the button when logged in', () => {
    render(<ButtonBannerWrapper user={fakeUser} />);

    screen.getByLabelText('Add a bathroom');
  });

  it('does not render the button when logged out', () => {
    render(<ButtonBannerWrapper user={null} />);

    expect(screen.queryByLabelText('Add a bathroom')).toBeNull();
  });

  it('no banner when not pressed', () => {
    render(<ButtonBannerWrapper user={fakeUser} />);

    expect(screen.queryByText('Choose a location for the bathroom')).toBeNull();
  });

  it('opens banner when pressed', () => {
    render(<ButtonBannerWrapper user={fakeUser} />);

    fireEvent.click(screen.getByLabelText('Add a bathroom'));
    screen.getByText('Choose a location for the bathroom');
  });
});
