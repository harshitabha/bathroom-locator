import MapFilters, {
  type StallsFilter,
  STALLS_FILTER_OPTIONS,
} from '../components/MapFilters';
import React from 'react';
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
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const STALLS_FILTER_LABEL = 'Stalls filter';

const FiltersHarness: React.FC = () => {
  const [selectedStalls, setSelectedStalls] = React.useState<StallsFilter[]>(
      [],
  );

  return (
    <MapFilters
      selectedStalls={selectedStalls}
      onStallsChange={(next) => setSelectedStalls(next)}
    />
  );
};

beforeEach(() => {
  render(<FiltersHarness />);
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('MapFilters', () => {
  it('renders stalls filter button', () => {
    expect(
        screen.getByLabelText(STALLS_FILTER_LABEL),
    ).toBeInTheDocument();
  });

  it('opens stalls dropdown on click', async () => {
    const stallsBtn = screen.getByLabelText(STALLS_FILTER_LABEL);
    fireEvent.click(stallsBtn);

    expect(
        await screen.findByText(STALLS_FILTER_OPTIONS[0]),
    ).toBeInTheDocument();
  });

  it('closes stalls dropdown on second click', async () => {
    const stallsBtn = screen.getByLabelText(STALLS_FILTER_LABEL);
    fireEvent.click(stallsBtn);
    fireEvent.click(stallsBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(STALLS_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });
  it('updates "stalls" to "2 Selected" after choosing 2 options', async () => {
    const stallsBtn = screen.getByLabelText(STALLS_FILTER_LABEL);
    fireEvent.click(stallsBtn);

    await screen.findByText(STALLS_FILTER_OPTIONS[0]);

    fireEvent.click(screen.getByText(STALLS_FILTER_OPTIONS[0]));
    fireEvent.click(screen.getByText(STALLS_FILTER_OPTIONS[1]));

    fireEvent.click(stallsBtn);

    await waitFor(() => {
      expect(screen.getByText('2 Selected')).toBeInTheDocument();
    });
  });
});
