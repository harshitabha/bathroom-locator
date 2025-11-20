import Logout from '../components/Logout';
import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
  type MockedFunction,
} from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import {supabase} from '../lib/supabaseClient';
import {AuthError} from '@supabase/supabase-js';

// mock supabase
vi.mock('../lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        signOut: vi.fn(),
      },
    },
  };
});

/**
 * Mocks sign out
 * @param {string | null} error error message
 * @returns {MockedFunction} mocked sign out function
 */
function mockSignOut(error: string | null) :
MockedFunction<() => Promise<{ error: AuthError | null }>> {
  const mockLogout = vi.mocked(supabase.auth.signOut);
  mockLogout.mockResolvedValueOnce(
      {error: error ? new AuthError(error) : null},
  );

  return mockLogout;
}

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('Logout component', () => {
  let setUserIdMock : React.Dispatch<React.SetStateAction<string | null>>;
  beforeEach(() => {
    setUserIdMock = vi.fn();

    render(
        <Logout setUserId={setUserIdMock}/>,
    );
  });

  it('renders logout button', async () => {
    expect(screen.getByText('Logout'));
  });

  it('calls sign out when clicked', async () => {
    const mockLogout = mockSignOut(null);

    const logoutButton = screen.getByText('Logout');
    await fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('sets userId to null on successful logout', async () => {
    mockSignOut(null);
    const logoutButton = screen.getByText('Logout');
    await fireEvent.click(logoutButton);

    expect(setUserIdMock).toHaveBeenCalledWith(null);
  });

  it('doesn\'t change user id state when logout fails', async () => {
    mockSignOut('Error signing out user');

    const logoutButton = screen.getByText('Logout');
    await fireEvent.click(logoutButton);

    expect(setUserIdMock).not.toHaveBeenCalled();
  });
});
