import {supabase} from '../lib/supabaseClient';
import { getCurrentUserId } from '../components/MapHeader';
import {
  describe,
  it,
  beforeEach,
  expect,
  vi,
  type MockedFunction,
} from 'vitest';
import {waitFor} from '@testing-library/react';
import {AuthError, type User, type UserResponse} from '@supabase/supabase-js';

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


/**
 * Mocks supabase get user id
 * @param {string | null} userId user id
 * @param {string | null} error error message
 * @returns {MockedFunction} mocked get user function
 */
function mockGetUserId(userId: string | null, error: string | null) :
MockedFunction<() => Promise<UserResponse>> {
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

  return mockGetUser;
}

describe('Supabase Client', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('calls supabase get user when get user id is called', async () => {
    const userId = '123';
    const error = null;
    const mockGetUser = mockGetUserId(userId, error);

    await getCurrentUserId();
    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled();
    });
  });

  it('returns user id if user is logged in', async () => {
    const userId = '123';
    const error = null;
    mockGetUserId(userId, error);

    expect(await getCurrentUserId()).toBe(userId);
  });

  it('returns null if no user is logged in', async () => {
    const userId = null;
    const error = null;
    mockGetUserId(userId, error);

    expect(await getCurrentUserId()).toBe(null);
  });

  it('returns null if getUser fails', async () => {
    const userId = null;
    const error = 'Error getting current user';
    mockGetUserId(userId, error);

    expect(await getCurrentUserId()).toBe(null);
  });
});


