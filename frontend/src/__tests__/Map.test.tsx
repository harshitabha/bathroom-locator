import Map from '../components/Map';
import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import {render, screen, fireEvent, cleanup, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

let latestOnMapClick: ((e?: any) => void) | undefined;

vi.mock('@react-google-maps/api', () => {
  return {
    GoogleMap: (props: any) => {
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
    Marker: (props: any) => (
      <button
        type="button"
        data-testid="marker"
        onClick={props.onClick}
      >
        {props.title}
      </button>
    ),
    InfoWindow: (props: any) => (
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
  openWalkingDirections: (...args: any[]) =>
    mockOpenWalkingDirections(...args),
}));

vi.mock('../components/AddBathroom', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      role="dialog"
      aria-label="Add bathroom"
      data-open={props.open ? 'open' : 'closed'}
      data-lat={props.position?.lat ?? ''}
      data-lng={props.position?.lng ?? ''}
    >
      MockAddBathroom
    </div>
  ),
}));

describe('Map component', () => {
  beforeEach(() => {
    (import.meta as any).env = {
      ...(import.meta as any).env,
      VITE_GOOGLE_MAPS_API_KEY: 'test-key',
    };

    (window as any).google = {
      maps: {
        MapTypeId: {ROADMAP: 'roadmap'},
        Size: vi.fn(),
        Point: vi.fn(),
      },
    };

    (navigator as any).geolocation = {
      getCurrentPosition: vi.fn(),
    };
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
    latestOnMapClick = undefined;
    delete (window as any).google;
    delete (navigator as any).geolocation;
  });

  function renderMapAndClickAddButton() {
    render(<Map />);
    const addButton = screen.getByLabelText('add');
    fireEvent.click(addButton);
  }

  it('renders the map region', () => {
    render(<Map />);
    screen.getByRole('region', {name: /bathroom map/i});
  });

  it('shows the banner text when the Add button is clicked', () => {
    renderMapAndClickAddButton();

    screen.getByText('Choose a location for the bathroom');
  });

  it('shows the "New Bathroom" heading when the Add button is clicked', () => {
    renderMapAndClickAddButton();

    screen.getByText('New Bathroom');
  });

  it('hides the banner when Cancel is clicked', async () => {
    renderMapAndClickAddButton();

    const cancelButton = screen.getByRole('button', {name: /cancel/i});
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Choose a location for the bathroom'),
      ).toBeNull();
    });
  });

  it('shows the Add button again after Cancel is clicked', async () => {
    renderMapAndClickAddButton();

    const cancelButton = screen.getByRole('button', {name: /cancel/i});
    fireEvent.click(cancelButton);

    await waitFor(() => {
      screen.getByLabelText('add');
    });
  });

  it('opens AddBathroom after clicking the map in add state', async () => {
    renderMapAndClickAddButton();

    if (!latestOnMapClick) {
      throw new Error('Map click handler not registered');
    }

    latestOnMapClick({
      latLng: {
        lat: () => 12.34,
        lng: () => 56.78,
      },
    });

    await waitFor(() => {
      const addBathroom = screen.getByRole('dialog', {
        name: /add bathroom/i,
      });

      expect(addBathroom).toHaveAttribute('data-open', 'open');
    });
  });

  it('passes the clicked latitude into AddBathroom', async () => {
    renderMapAndClickAddButton();

    if (!latestOnMapClick) {
      throw new Error('Map click handler not registered');
    }

    latestOnMapClick({
      latLng: {
        lat: () => 12.34,
        lng: () => 56.78,
      },
    });

    await waitFor(() => {
      const addBathroom = screen.getByRole('dialog', {
        name: /add bathroom/i,
      });

      expect(addBathroom).toHaveAttribute('data-lat', '12.34');
    });
  });

  it('passes the clicked longitude into AddBathroom', async () => {
    renderMapAndClickAddButton();

    if (!latestOnMapClick) {
      throw new Error('Map click handler not registered');
    }

    latestOnMapClick({
      latLng: {
        lat: () => 12.34,
        lng: () => 56.78,
      },
    });

    await waitFor(() => {
      const addBathroom = screen.getByRole('dialog', {
        name: /add bathroom/i,
      });

      expect(addBathroom).toHaveAttribute('data-lng', '56.78');
    });
  });

  it('hides the banner after clicking the map in add state', async () => {
    renderMapAndClickAddButton();

    if (!latestOnMapClick) {
      throw new Error('Map click handler not registered');
    }

    latestOnMapClick({
      latLng: {
        lat: () => 12.34,
        lng: () => 56.78,
      },
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Choose a location for the bathroom'),
      ).toBeNull();
    });
  });
});
