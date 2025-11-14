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
        <div data-testid="google-map">
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
      data-testid="add-bathroom"
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

  it('renders the Google Map', () => {
    render(<Map />);
    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('enters add mode when the FAB is clicked which will show the banner and top of popup form)', () => {
    render(<Map />);

    const fab = screen.getByRole('button', {name: /add/i});
    fireEvent.click(fab);

    expect(
      screen.getByText('Choose a location for the bathroom'),
    ).toBeInTheDocument();

    expect(screen.getByText('New Bathroom')).toBeInTheDocument();
  });

  it('exits the add state when the Snackbar Cancel button is clicked', async () => {
    render(<Map />);

    const fab = screen.getByRole('button', {name: /add/i});
    fireEvent.click(fab);

    const cancelButton = screen.getByRole('button', {name: 'Cancel'});
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Choose a location for the bathroom'),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', {name: /add/i}),
    ).toBeInTheDocument();
  });

  it('clicking the map in the add state opens AddBathroom with a position and hides banner', async () => {
    render(<Map />);

    const fab = screen.getByRole('button', {name: /add/i});
    fireEvent.click(fab);

    expect(typeof latestOnMapClick).toBe('function');

    latestOnMapClick?.({
      latLng: {
        lat: () => 12.34,
        lng: () => 56.78,
      },
    });

    await waitFor(() => {
      const addBathroom = screen.getByTestId('add-bathroom');
      expect(addBathroom.getAttribute('data-open')).toBe('open');
      expect(addBathroom.getAttribute('data-lat')).toBe('12.34');
      expect(addBathroom.getAttribute('data-lng')).toBe('56.78');

      expect(
        screen.queryByText('Choose a location for the bathroom'),
      ).not.toBeInTheDocument();
    });
  });
});