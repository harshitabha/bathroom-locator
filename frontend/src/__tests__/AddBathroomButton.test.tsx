import {useState} from 'react';
import {describe, it, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {supabase} from '../lib/supabaseClient';
import {AuthError, type User, type UserResponse} from '@supabase/supabase-js';
import AddBathroomButton from '../components/AddBathroomButton';
import AddBathroomBanner from '../components/AddBathroomBanner';
import AppContext from '../context/AppContext';

/**
 * Mocks supabase get user id
 * @param {string | null} userId user id
 * @param {string | null} error error message
 */
function mockGetUserId(userId: string | null, error: string | null) {
  const user : User | null = userId ? {
    id: userId,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()} :
    null;

  const mockGetUser = vi.mocked(supabase.auth.getUser);
  mockGetUser.mockResolvedValueOnce({
    data: {user: user},
    error: error ? new AuthError(error) : null,
  } as UserResponse);
}

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
      },
    },
  };
});

afterEach(() => {
  cleanup();
});

describe('AddBathroomButton', () => {
  it('renders the button when logged in', () => {
    mockGetUserId('123', null);
    render(<ButtonBannerWrapper initUserId={'123'} />);

    screen.getByLabelText('Add a bathroom');
  });

  it('does not render the button when logged out', () => {
    mockGetUserId(null, null);
    render(<ButtonBannerWrapper initUserId={null} />);

    expect(screen.queryByLabelText('Add a bathroom')).toBeNull();
  });

  it('no banner when not pressed', () => {
    mockGetUserId('123', null);
    render(<ButtonBannerWrapper initUserId={'123'} />);

    expect(screen.queryByText('Choose a location for the bathroom')).toBeNull();
  });

  it('opens banner when pressed', () => {
    mockGetUserId('123', null);
    render(<ButtonBannerWrapper initUserId={'123'} />);

    fireEvent.click(screen.getByLabelText('Add a bathroom'));
    screen.getByText('Choose a location for the bathroom');
  });
});
