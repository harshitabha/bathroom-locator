import MapFilters, {
  type AmenityFilter,
  AMENITIES_FILTER_OPTIONS,
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

const AMENITIES_FILTER_LABEL = 'Amenities filter';

const FiltersHarness: React.FC = () => {
  const [selectedAmenities, setSelectedAmenities] =
    React.useState<AmenityFilter[]>([]);

  return (
    <MapFilters
      selectedAmenities={selectedAmenities}
      onAmenitiesChange={(next) => setSelectedAmenities(next)}
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
  it('renders amenities filter button', () => {
    expect(
        screen.getByLabelText(AMENITIES_FILTER_LABEL),
    ).toBeInTheDocument();
  });

  it('opens amenities dropdown on click', async () => {
    const amenitiesBtn = screen.getByLabelText(AMENITIES_FILTER_LABEL);
    fireEvent.click(amenitiesBtn);

    expect(
        await screen.findByText(AMENITIES_FILTER_OPTIONS[0]),
    ).toBeInTheDocument();
  });

  it('closes amenities dropdown on second click', async () => {
    const amenitiesBtn = screen.getByLabelText(AMENITIES_FILTER_LABEL);
    fireEvent.click(amenitiesBtn);
    fireEvent.click(amenitiesBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(AMENITIES_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });

  it('updates amenities to "2 Selected" after choosing 2 options', async () => {
    const amenitiesBtn = screen.getByLabelText(AMENITIES_FILTER_LABEL);
    fireEvent.click(amenitiesBtn);

    fireEvent.click(screen.getByText(AMENITIES_FILTER_OPTIONS[0]));
    fireEvent.click(screen.getByText(AMENITIES_FILTER_OPTIONS[1]));

    await waitFor(() => {
      expect(screen.getByText('2 Selected')).toBeInTheDocument();
    });
  });
});
