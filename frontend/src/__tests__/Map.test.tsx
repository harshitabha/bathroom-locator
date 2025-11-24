import type React from 'react';
import Map from '../components/Map';
import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

const fetchMock = vi.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

const testBathroom = {
  id: 'bath-1',
  name: 'Test Bathroom',
  position: {lat: 36.123456, lng: -122.765432},
  description: 'Near the blue door',
  num_stalls: 1,
  amenities: {},
  gender: {male: false, female: false, gender_neutral: true},
  likes: 0,
};

type MapClickEvent = {
  latLng: {
    lat: () => number;
    lng: () => number;
  };
};

let latestOnMapClick: ((e: MapClickEvent) => void) | undefined;

vi.mock('@react-google-maps/api', () => {
  return {
    GoogleMap: (props: {
      children?: React.ReactNode;
      onClick?: (e: MapClickEvent) => void;
      onLoad?: (map: google.maps.Map) => void;
    }) => {
      latestOnMapClick = props.onClick;
      const mockMap = {
        getBounds: () => ({
          getNorthEast: () => ({lat: () => 37.1, lng: () => -121.9}),
          getSouthWest: () => ({lat: () => 36.9, lng: () => -122.1}),
        }),
      } as unknown as google.maps.Map;
      props.onLoad?.(mockMap);
      return (
        <div role="region" aria-label="Bathroom map">
          {props.children}
        </div>
      );
    },
    Marker: (props: {
      title?: React.ReactNode;
      onClick?: () => void;
    }) => (
      <button
        type="button"
        data-testid="marker"
        onClick={props.onClick}
      >
        {props.title}
      </button>
    ),
    InfoWindow: (props: {children?: React.ReactNode}) => (
      <div data-testid="info-window">{props.children}</div>
    ),
    useLoadScript: () => ({
      isLoaded: true,
      loadError: undefined,
    }),
  };
});

describe('Add bathroom button & flow', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');

    (window as {google: unknown}).google = {
      maps: {
        MapTypeId: {
          ROADMAP: 'roadmap',
        },
        Size: vi.fn(),
        Point: vi.fn(),
        importLibrary: vi.fn().mockResolvedValue({
          AutocompleteSessionToken: vi.fn(),
          AutocompleteSuggestion: {
            fetchAutocompleteSuggestions: vi.fn().mockResolvedValue({
              suggestions: [],
            }),
          },
        }),
      },
    };

    (navigator as typeof navigator & {geolocation?: Geolocation})
        .geolocation = {
          getCurrentPosition: vi.fn(),
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        };

    fetchMock.mockReset();
    fetchMock.mockImplementation((url: string, opts?: unknown) => {
      if (url.includes('/bathroom/updates')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([]),
        } as Response);
      }
      if (url.includes('/bathroom?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([testBathroom]),
        } as Response);
      }
      if (url.endsWith('/bathroom') && (opts as {method?: string}
         | undefined)?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ([]),
      } as Response);
    });
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
    vi.unstubAllEnvs();
    latestOnMapClick = undefined;
    delete (window as {google?: unknown}).google;
    delete (navigator as {geolocation?: unknown}).geolocation;
  });

  it('renders the add bathroom button', () => {
    render(
        <MemoryRouter>
          <Map />
        </MemoryRouter>,
    );

    screen.getByLabelText('Add a bathroom');
  });

  it('shows the banner after clicking the add bathroom button', () => {
    render(
        <MemoryRouter>
          <Map />
        </MemoryRouter>,
    );

    const addButton = screen.getByLabelText('Add a bathroom');
    fireEvent.click(addButton);

    screen.getByText('Choose a location for the bathroom');
  });

  it('adds a new marker after choosing a location and saving', async () => {
    render(
        <MemoryRouter>
          <Map />
        </MemoryRouter>,
    );

    const addButton = screen.getByLabelText('Add a bathroom');
    fireEvent.click(addButton);

    // Simulate clicking on the map to choose a position
    if (!latestOnMapClick) {
      throw new Error('Map click handler not registered');
    }

    latestOnMapClick({
      latLng: {
        lat: () => 36.123456,
        lng: () => -122.765432,
      },
    });

    // Open the BathroomForm from the peek card
    const peekCardTitle = await screen.findByText('New Bathroom');
    fireEvent.click(peekCardTitle);

    // Fill in form
    const nameInput = screen.getByLabelText(/Bathroom Name/i);
    const detailsInput = screen.getByLabelText(/Bathroom Description/i);

    fireEvent.change(nameInput, {
      target: {value: 'Test Bathroom'},
    });
    fireEvent.change(detailsInput, {
      target: {value: 'Near the blue door'},
    });

    const saveButton = screen.getByRole('button', {name: 'Save'});
    fireEvent.click(saveButton);

    // After saving, a new marker should appear
    await waitFor(() => {
      expect(
          screen.getByText('Test Bathroom'),
      ).toBeInTheDocument();
    });
  });
});
