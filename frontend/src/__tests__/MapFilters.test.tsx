import MapFilters, {
  type AmenityFilter,
  AMENITIES_FILTER_OPTIONS,
} from '../components/MapFilters';
import {
  filterBathroomsByAmenities,
} from '../utils/filterBathrooms';
import type {Bathroom} from '../types';
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

describe('filterBathroomsByAmenities helper', () => {
  const sampleBathrooms: Bathroom[] = [
    {
      id: 'soap-mirror',
      name: 'Soap + Mirror',
      description: '',
      position: {lat: 0, lng: 0},
      likes: 0,
      amenities: {
        soap: true,
        mirror: true,
        paper_towel: false,
        hand_dryer: false,
        toilet_paper: false,
        menstrual_products: false,
      },
    },
    {
      id: 'full',
      name: 'All amenities',
      description: '',
      position: {lat: 0, lng: 0},
      likes: 0,
      amenities: {
        soap: true,
        mirror: true,
        paper_towel: true,
        hand_dryer: true,
        toilet_paper: true,
        menstrual_products: true,
      },
    },
    {
      id: 'none',
      name: 'No amenities',
      description: '',
      position: {lat: 0, lng: 0},
      likes: 0,
    },
  ];

  it('returns all bathrooms when no amenities are selected', () => {
    const result = filterBathroomsByAmenities(sampleBathrooms, []);
    expect(result).toEqual(sampleBathrooms);
  });

  it('keeps bathrooms that include every selected amenity', () => {
    const result = filterBathroomsByAmenities(sampleBathrooms, [
      'Soap',
      'Mirror',
    ]);
    expect(result.map((b) => b.id)).toEqual(['soap-mirror', 'full']);
  });

  it('excludes bathrooms without the requested amenities', () => {
    const result = filterBathroomsByAmenities(sampleBathrooms, [
      'Soap',
      'Hand Dryer',
    ]);
    expect(result.map((b) => b.id)).toEqual(['full']);
  });

  it('filters out bathrooms with missing amenity info', () => {
    const result = filterBathroomsByAmenities(sampleBathrooms, [
      'Menstrual Products',
    ]);
    expect(result.some((b) => b.id === 'none')).toBe(false);
    expect(result.some((b) => b.id === 'none')).toBe(false);
  });
});
