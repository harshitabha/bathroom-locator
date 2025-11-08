// RTL matchers
import '@testing-library/jest-dom/vitest';

// Minimal window.matchMedia so MUI useMediaQuery doesn’t crash
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// small google maps shim used by Map.tsx
(globalThis as any).google = {
  maps: {
    Size: class Size { constructor(public width:number, public height:number) {} },
    Point: class Point { constructor(public x:number, public y:number) {} },
    MapTypeId: { ROADMAP: 'roadmap' },
  },
};
