import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Google Maps
global.google = {
  maps: {
    Polyline: vi.fn().mockImplementation(() => ({
      setMap: vi.fn(),
      addListener: vi.fn(),
    })),
    Map: vi.fn().mockImplementation(() => ({
      addListener: vi.fn(),
      panTo: vi.fn(),
      setZoom: vi.fn(),
    })),
    event: {
      removeListener: vi.fn(),
    },
    ControlPosition: {
      TOP_CENTER: 0,
      RIGHT_BOTTOM: 1,
    },
  },
} as any;
