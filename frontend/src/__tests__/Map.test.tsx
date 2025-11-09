import '@testing-library/jest-dom/vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Map from '../components/Map';
import { vi } from 'vitest';
import { mockMatchMedia } from '../__test-helpers__/testUtils';

/* -----------------------------
   Mocks
------------------------------*/

// 1) Mock env var read used by Map
vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');

// Minimal global google used by Map
beforeAll(() => {
  // @ts-expect-error - we’re creating the google shim for tests
  global.window.google = {
    maps: {
      Size: class Size {
        constructor(public width: number, public height: number) {}
      },
      Point: class Point {
        constructor(public x: number, public y: number) {}
      },
      MapTypeId: { ROADMAP: 'roadmap' },
    },
  };
});

// 2) Mock geolocation
beforeAll(() => {
  // @ts-expect-error
  global.navigator.geolocation = {
    getCurrentPosition: (success: any) =>
      success({ coords: { latitude: 36.99, longitude: -122.0589 } }),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };
});

// 3) Mock openWalkingDirections util
vi.mock('../utils/navigation', () => ({
  openWalkingDirections: vi.fn(),
}));

// 4) Mock @react-google-maps/api: useLoadScript + light-weight elements
let lastMapProps: any = null;
vi.mock('@react-google-maps/api', async () => {
  const React = await import('react');

  const GoogleMap = ({
    onClick,
    children,
    mapContainerClassName,
    onLoad,
    ...rest
  }: any) => {
    lastMapProps = { onClick, rest };
    React.useEffect(() => {
      if (onLoad) onLoad({ getBounds: () => null });
    }, [onLoad]);

    return (
      <div
        data-testid="google-map"
        className={mapContainerClassName}
        onClick={() => {
          const latLng = { lat: () => 36.991, lng: () => -122.059 };
          onClick?.({ latLng });
        }}
      >
        {children}
      </div>
    );
  };

  const Marker = ({ title, onClick }: any) => (
    <button
      type="button"
      aria-label={`marker:${title ?? 'draft'}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    />
  );

  const InfoWindow = ({ children }: any) => <div role="dialog">{children}</div>;

  const useLoadScript = () => ({ isLoaded: true, loadError: undefined });

  return { GoogleMap, Marker, InfoWindow, useLoadScript };
});

/* =============================
   TESTS
============================= */

describe('Map add-flow & info window', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia(true); // treat as mobile, SwipeableDrawer path in AddBathroomPage
  });

  it('FAB enters add mode and shows the banner', async () => {
    const user = userEvent.setup();
    render(<Map />);

    // enter add mode
    const fab = await screen.findByRole('button', { name: /add/i });
    await user.click(fab);

    // banner visible
    expect(
      await screen.findByText(/Choose a location for the bathroom/i)
    ).toBeInTheDocument();
  });

  it('clicking the map in add mode opens the form', async () => {
    const user = userEvent.setup();
    render(<Map />);

    // Enter add mode
    const addBtn = screen.getByRole('button', { name: /add/i });
    await user.click(addBtn);

    // Click on the map to drop a draft pin + open the sheet
    const map = screen.getByTestId('google-map');
    await user.click(map);

    // Assert that the Add Bathroom sheet is open (form visible)
    await screen.findByLabelText(/bathroom name/i);
  });

  it('closing the sheet via Cancel keeps add mode but re-opens the banner', async () => {
    const user = userEvent.setup();
    render(<Map />);

    await user.click(await screen.findByRole('button', { name: /add/i }));
    await user.click(screen.getByTestId('google-map'));

    // cancel within sheet
    await user.click(await screen.findByRole('button', { name: /^cancel$/i }));

    // Wait for the sheet to close
    await waitForElementToBeRemoved(() =>
      screen.queryByLabelText(/Bathroom Name/i)
    );

    // Then verify banner is visible again
    expect(
      await screen.findByText(/Choose a location for the bathroom/i)
    ).toBeInTheDocument();
  });

  it('saving adds a place and fully exits add mode (banner hidden, FAB back)', async () => {
    const user = userEvent.setup();
    render(<Map />);

    // start + drop draft pin
    await user.click(await screen.findByRole('button', { name: /add/i }));
    await user.click(screen.getByTestId('google-map'));

    // fill form
    await user.type(
      await screen.findByLabelText(/Bathroom Name/i),
      'Cowell Restroom'
    );
    await user.type(
      screen.getByLabelText(/Bathroom Description/i),
      'near lobby'
    );

    // save
    await user.click(screen.getByRole('button', { name: /save/i }));

    // banner hidden
    expect(
      screen.queryByText(/Choose a location for the bathroom/i)
    ).not.toBeInTheDocument();

    // Add FAB is back
    expect(
      await screen.findByRole('button', { name: /add/i })
    ).toBeInTheDocument();
  });

  it('marker click opens InfoWindow and "Get Directions" triggers util', async () => {
    const user = userEvent.setup();
    const { openWalkingDirections } = await import('../utils/navigation');
    render(<Map />);

    // Add a bathroom via form so a real marker exists
    await user.click(await screen.findByRole('button', { name: /add/i }));
    await user.click(screen.getByTestId('google-map'));
    await user.type(
      await screen.findByLabelText(/Bathroom Name/i),
      'McHenry'
    );
    await user.type(
      screen.getByLabelText(/Bathroom Description/i),
      'downstairs'
    );
    await user.click(screen.getByRole('button', { name: /save/i }));

    // There should be a marker button with accessible name "marker:McHenry"
    const markerBtn = await screen.findByRole('button', {
      name: /marker:McHenry/i,
    });
    await user.click(markerBtn);

    // Just find the "Get Directions" button directly
    const cta = await screen.findByRole('button', {
      name: /get directions/i,
    });
    await user.click(cta);

    // Verify openWalkingDirections was called correctly
    expect(openWalkingDirections).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number)
    );

    // Ensure arguments are numeric
    const args = (openWalkingDirections as any).mock.calls[0];
    expect(typeof args[0]).toBe('number');
    expect(typeof args[1]).toBe('number');
  });
});