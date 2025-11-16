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
import '@testing-library/jest-dom/vitest';

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
    }) => {
      latestOnMapClick = props.onClick;
      return (
        <div
          role="region"
          aria-label="Bathroom map"
        >
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

const mockOpenWalkingDirections = vi.fn();

vi.mock('../utils/navigation', () => ({
  __esModule: true,
  openWalkingDirections: (
      ...args: unknown[]
  ) => mockOpenWalkingDirections(...args),
}));

type AddBathroomMockProps = {
  open: boolean;
  position?: {lat: number; lng: number} | null;
  onSubmit: (data: {
    name: string;
    details?: string;
    position: {lat: number; lng: number};
  }) => void;
};

vi.mock('../components/AddBathroom', () => ({
  __esModule: true,
  default: (props: AddBathroomMockProps) => (
    <div
      role="dialog"
      aria-label="Add bathroom"
      data-open={props.open ? 'open' : 'closed'}
      data-lat={props.position?.lat ?? ''}
      data-lng={props.position?.lng ?? ''}
    >
      MockAddBathroom
      {props.open && props.position && (
        <button
          type="button"
          onClick={() =>
            props.onSubmit({
              name: 'Test Bathroom',
              details: 'Near the blue door',
              position: props.position!,
            })
          }
        >
          Save bathroom
        </button>
      )}
    </div>
  ),
}));

describe('Map add bathroom button & flow', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');

    (window as {google: unknown}).google = {
      maps: {
        MapTypeId: {
          ROADMAP: 'roadmap',
        },
        Size: vi.fn(),
        Point: vi.fn(),
      },
    };

    (navigator as typeof navigator & {geolocation?: Geolocation})
        .geolocation = {
          getCurrentPosition: vi.fn(),
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        };
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
    vi.unstubAllEnvs();
    latestOnMapClick = undefined;
    delete (window as {google?: unknown}).google;
    delete (navigator as {geolocation?: unknown}).geolocation;
  });

  it('renders the Add bathroom button', () => {
    render(<Map />);

    screen.getByLabelText('add');
  });

  it('shows the banner after clicking the Add bathroom button', () => {
    render(<Map />);

    const addButton = screen.getByLabelText('add');
    fireEvent.click(addButton);

    screen.getByText('Choose a location for the bathroom');
  });

  it('adds a new marker after choosing a location and saving', async () => {
    render(<Map />);

    const addButton = screen.getByLabelText('add');
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

    // Click the mocked save button inside AddBathroom
    const saveButton = await screen.findByText('Save bathroom');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
          screen.getByText('Test Bathroom'),
      ).toBeInTheDocument();
    });
  });
});
