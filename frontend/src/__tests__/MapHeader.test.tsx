import MapHeader from '../components/MapHeader';
import {supabase} from '../lib/supabaseClient';
import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
  type Mock,
} from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import {AuthProvider} from '../providers/AuthProvider';
import userEvent from '@testing-library/user-event';

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

/**
 * mocks supabase get user
 * @param {string | null} id id
 */
function mockUser(id: string | null) {
  (supabase.auth.getUser as Mock).mockResolvedValue({
    data: {user: id ? {id} : null},
    error: null,
  });

  (supabase.auth.onAuthStateChange as Mock).mockReturnValue({
    data: {subscription: {unsubscribe: vi.fn()}},
  });
}

/**
 * mocks supabase signout
 * @param {string | null} error error message
 */
function mockSignOut(error: string | null) {
  (supabase.auth.signOut as Mock).mockResolvedValue({
    error: error ? {message: error} : null,
  });
}

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

describe('Map Header component when not logged in', () => {
  beforeEach(() => {
    render(
        <MemoryRouter>
          <MapHeader
            map={null}
            bannerOpen={false}
            onCancelBanner={() => {}}
          />
        </MemoryRouter>,
    );
  });

  it('renders the login button', async () => {
    const loginButton = screen.getByText('Login');
    expect(loginButton);
  });

  it('hides the profile picture', async () => {
    const profilePicture = screen.queryByLabelText('Profile Picture');
    expect(profilePicture).toBeNull();
  });

  it('leads to login page when login button is clicked', async () => {
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

describe('Map Header component when logged in', () => {
  beforeEach(() => {
    mockUser('123');

    render(
        <MemoryRouter>
          <AuthProvider>
            <MapHeader
              map={null}
              bannerOpen={false}
              onCancelBanner={() => {}}
            />
          </AuthProvider>
        </MemoryRouter>,
    );
  });

  it('hides the login button', async () => {
    await waitFor(() => {
      expect(screen.queryByText('Login')).toBeNull();
    });
  });

  it('renders the profile picture', async () => {
    await waitFor(() => {
      screen.getByLabelText('Profile Picture');
    });
  });

  it('displays menu when profile picture is clicked', async () => {
    const profilePicture = await waitFor(() => {
      return screen.getByLabelText('Profile Picture');
    });

    fireEvent.click(profilePicture);

    screen.getByText('Logout');
  });

  it('hides menu when clicking escape button', async () => {
    const profilePicture = await waitFor(() => {
      return screen.getByLabelText('Profile Picture');
    });

    await fireEvent.click(profilePicture);

    // click escape button
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Logout')).toBeNull();
    });
  });

  it('renders login button when logout is successful', async () => {
    const profilePicture = await waitFor(() => {
      return screen.getByLabelText('Profile Picture');
    });

    fireEvent.click(profilePicture);

    const logoutButton = screen.getByText('Logout');
    // mock succesful sign out
    mockSignOut(null);
    fireEvent.click(logoutButton);
    await waitFor(() => {
      screen.getByText('Login');
    });
  });
});

describe('Map Header component on sign out failure', async () => {
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

    mockUser('123');

    mockSignOut('Error signing user out');

    render(
        <MemoryRouter>
          <AuthProvider>
            <MapHeader
              map={null}
              bannerOpen={false}
              onCancelBanner={() => {}}
            />
          </AuthProvider>
        </MemoryRouter>,
    );
  });

  it('doesn\'t display login button', async () => {
    const profilePicture = await waitFor(() => {
      return screen.getByLabelText('Profile Picture');
    });

    fireEvent.click(profilePicture);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.queryByText('Login')).toBeNull();
    });
  });

  it('keeps profile pic display', async () => {
    const profilePicture = await waitFor(() => {
      return screen.getByLabelText('Profile Picture');
    });

    fireEvent.click(profilePicture);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      screen.getByLabelText('Profile Picture');
    });
  });
});

describe('Map Header component when getting current user fails', () => {
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

    mockUser(null);

    render(
        <MemoryRouter>
          <AuthProvider>
            <MapHeader
              map={null}
              bannerOpen={false}
              onCancelBanner={() => {}}
            />
          </AuthProvider>
        </MemoryRouter>,
    );
  });

  it('defaults to login button', async () => {
    screen.getByText('Login');
  });
});
