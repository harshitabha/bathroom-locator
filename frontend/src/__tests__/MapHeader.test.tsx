import MapHeader from '../components/MapHeader';
import {
  type AmenityFilter,
} from '../components/MapFilters';
import {supabase} from '../lib/supabaseClient';
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
  waitFor,
} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import {AuthError} from '@supabase/supabase-js';
import AppContext from '../context/AppContext';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';

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
 * Sets up google.maps mock
 */
function setupGoogleMapsMock() {
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
}

/**
 *
 * @param {object} root0 props
 * @param {string | null} root0.initUserId userid
 * @returns {object} Mapheader + AppContext
 */
function ContextWrapper({initUserId}: {
  initUserId: string | null;
}) {
  const [userId, setUserId] = useState<string | null>(initUserId);
  const [selectedAmenities, setSelectedAmenities] =
    useState<AmenityFilter[]>([]);
  const getCurrentUserId = async () => {};

  return (
    <MemoryRouter>
      <AppContext value={{userId, setUserId, getCurrentUserId}}>
        <MapHeader
          map={null}
          bannerOpen={false}
          onCancelBanner={() => {}}
          selectedAmenities={selectedAmenities}
          onAmenitiesChange={setSelectedAmenities}
        />
      </AppContext>
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Map Header component when not logged in', () => {
  beforeEach(() => {
    setupGoogleMapsMock();
    render(
        <ContextWrapper initUserId={null}/>,
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
    setupGoogleMapsMock();
    render(
        <ContextWrapper initUserId={'123'}/>,
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
    setupGoogleMapsMock();
    mockSignOut('Error signing user out');
    render(
        <ContextWrapper initUserId={'123'}/>,
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
    setupGoogleMapsMock();
    render(
        <ContextWrapper initUserId={null}/>,
    );
  });

  it('defaults to login button', async () => {
    screen.getByText('Login');
  });
});
