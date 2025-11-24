import MapHeader from '../components/MapHeader';

import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import {AuthContext} from '../providers/AuthProvider';
import type {User} from '@supabase/supabase-js';

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate, // override useNavigate
  };
});

// google maps mock for SearchBar
type GoogleWithMaps = {
  maps: {
    importLibrary: (libraryName: string) => Promise<unknown>;
  };
};
const importLibraryMock = vi.fn<GoogleWithMaps['maps']['importLibrary']>();

/**
 * @param {object} user User type
 * @returns {object} render using user
 */
function renderWithAuth(user: User | null) {
  return render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user,
            signOut: vi.fn(),
          }}
        >
          <MapHeader
            map={null}
            bannerOpen={false}
            onCancelBanner={() => {}}
          />
        </AuthContext.Provider>
      </MemoryRouter>,
  );
}

const fakeUser: User = {
  id: '123',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  identities: [],
};

beforeEach(() => {
  (globalThis as unknown as { google: GoogleWithMaps }).google = {
    maps: {
      importLibrary: importLibraryMock,
    },
  };

  importLibraryMock.mockResolvedValue({
    AutocompleteSessionToken: vi.fn(),
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions: vi
          .fn()
          .mockResolvedValue({suggestions: []}),
    },
  });
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Map Header component', () => {
  it('renders the login button by default', async () => {
    renderWithAuth(null);
    const loginButton = screen.getByRole('button', {name: 'Login'});
    expect(loginButton);
  });

  it('hides the profile picture by default', async () => {
    renderWithAuth(null);
    const profilePicture = screen.queryByLabelText('profile-picture');
    expect(profilePicture).toBeNull();
  });

  it('renders profile picture when logged in', () => {
    renderWithAuth(fakeUser);
    screen.getByLabelText('profile-picture');
  });

  it('hides the login button when logged in', () => {
    renderWithAuth(fakeUser);
    expect(screen.queryByText('Login')).toBeNull();
  });

  it('leads to login page when login button is clicked', async () => {
    renderWithAuth(null);
    const loginButton = screen.getByRole('button', {name: 'Login'});
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
