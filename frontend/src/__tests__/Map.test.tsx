/**
 * @vitest-environment jsdom
 */
import {describe, it, beforeAll, beforeEach, afterEach, expect, vi} from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Map from '../components/Map';

// mock Google Maps API
vi.mock("@react-google-maps/api", () => ({
    GoogleMap: ({ children }: any) => <div data-testid="mock-map">{children}</div>,
    Marker: ({ position, icon }: any) => (
        <div data-testid="mock-marker" data-lat={position.lat} data-lng={position.lng}>
            {icon ? "user-marker" : "bathroom-marker"}
        </div>
    ),
    InfoWindow: ({ children }: any) => <div>{children}</div>,
    useLoadScript: () => ({ isLoaded: true, loadError: null }),
}));

// mock google to prevent not defined error
beforeAll(() => {
    (globalThis as any).google = {
      maps: {
        MapTypeId: {
            ROADMAP: 'roadmap',
        },
        LatLng: vi.fn(),
        Map: vi.fn(),
        Marker: vi.fn(),
        Circle: vi.fn(),
        InfoWindow: vi.fn(),
        SymbolPath: { CIRCLE: 'circle' },
      },
    };
});
  
// mock geolocation
beforeEach(() => {
    const mockGeolocation = {
        getCurrentPosition: vi.fn((success) =>
            success({ coords: { latitude: 36.99, longitude: -122.06 } })
        ),
        watchPosition: vi.fn((success) =>
            // call success immediately
            success({ coords: { latitude: 36.99, longitude: -122.06 } })
        ),
        clearWatch: vi.fn(),
    };
    (globalThis as any).navigator.geolocation = mockGeolocation;
});
  
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

// Map tests

describe("Map component", () => {
    it("renders user location marker when geolocation succeeds", async () => {
        render(<Map />);

        // Wait for async map render
        await waitFor(() => {
            const marker = screen.getByTestId("mock-marker");
            expect(marker).toBeInTheDocument();
            expect(marker).toHaveAttribute("data-lat", "36.99");
            expect(marker).toHaveAttribute("data-lng", "-122.06");
        });
    });

    it("renders map even if geolocation fails", async () => {
        // mock geolocation failure
        (globalThis as any).navigator.geolocation.getCurrentPosition = vi.fn(
            (_success, error) => error({ message: "Location unavailable" })
        );
        render(<Map />);
        const map = await screen.findByTestId("mock-map");
        expect(map).toBeInTheDocument();
    });
});
