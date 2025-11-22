import MapHeader from '../components/MapHeader';

import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

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

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Map Header component', () => {
  it('renders the login button by default', async () => {
    const loginButton = screen.getByRole('button', {name: 'Login'});
    expect(loginButton);
  });

  it('hides the profile picture by default', async () => {
    const profilePicture = screen.queryByLabelText('profile-picture');
    expect(profilePicture).not.toBeInTheDocument();
  });

  it('leads to login page when login button is clicked', async () => {
    const loginButton = screen.getByRole('button', {name: 'Login'});
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
