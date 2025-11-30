import MapFilters, {
  type GenderFilter,
  GENDER_FILTER_OPTIONS,
} from '../components/MapFilters';
import {filterBathroomsByGender} from '../utils/filterBathrooms';
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

const GENDER_FILTER_LABEL = 'Gender filter';

const FiltersHarness: React.FC = () => {
  const [selectedGenders, setSelectedGenders] = React.useState<GenderFilter[]>(
      [],
  );

  return (
    <MapFilters
      selectedGenders={selectedGenders}
      onGendersChange={(next) => setSelectedGenders(next)}
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
  it('renders gender filter button', () => {
    expect(
        screen.getByLabelText(GENDER_FILTER_LABEL),
    ).toBeInTheDocument();
  });

  it('opens gender dropdown on click', async () => {
    const genderBtn = screen.getByLabelText(GENDER_FILTER_LABEL);
    fireEvent.click(genderBtn);

    expect(
        await screen.findByText(GENDER_FILTER_OPTIONS[0]),
    ).toBeInTheDocument();
  });

  it('closes gender dropdown on second click', async () => {
    const genderBtn = screen.getByLabelText(GENDER_FILTER_LABEL);
    fireEvent.click(genderBtn);
    fireEvent.click(genderBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(GENDER_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });

  it('updates "gender" to "2 Selected" after choosing 2 options', async () => {
    const genderBtn = screen.getByLabelText(GENDER_FILTER_LABEL);
    fireEvent.click(genderBtn);

    await screen.findByText(GENDER_FILTER_OPTIONS[0]);

    fireEvent.click(screen.getByText(GENDER_FILTER_OPTIONS[0]));
    fireEvent.click(screen.getByText(GENDER_FILTER_OPTIONS[1]));

    fireEvent.click(genderBtn);

    await waitFor(() => {
      expect(screen.getByText('2 Selected')).toBeInTheDocument();
    });
  });
});

describe('filterBathroomsByGender helper', () => {
  const makeBathroom = (
      id: string,
      gender?: Bathroom['gender'],
  ): Bathroom => ({
    id,
    name: `Bathroom ${id}`,
    description: 'Test bathroom',
    position: {lat: 0, lng: 0},
    likes: 0,
    gender,
  });

  const sampleBathrooms: Bathroom[] = [
    makeBathroom('male-only', {
      male: true,
      female: false,
      gender_neutral: false,
    }),
    makeBathroom('female-only', {
      male: false,
      female: true,
      gender_neutral: false,
    }),
    makeBathroom('gender-neutral', {
      male: false,
      female: false,
      gender_neutral: true,
    }),
    makeBathroom('no-gender'),
  ];

  it('returns all bathrooms when no gender filters are selected', () => {
    const result = filterBathroomsByGender(sampleBathrooms, []);
    expect(result).toEqual(sampleBathrooms);
  });

  it('filters bathrooms so at least one selected gender matches', () => {
    const selected: GenderFilter[] = ['Male', 'Female'];
    const result = filterBathroomsByGender(sampleBathrooms, selected);
    expect(result.map((b) => b.id)).toEqual(['male-only', 'female-only']);
  });

  it('returns only gender neutral bathrooms when filter is selected', () => {
    const selected: GenderFilter[] = ['Gender Neutral'];
    const result = filterBathroomsByGender(sampleBathrooms, selected);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('gender-neutral');
  });

  it('excludes bathrooms with no gender info when filters are active', () => {
    const selected: GenderFilter[] = ['Female'];
    const result = filterBathroomsByGender(sampleBathrooms, selected);
    expect(result.some((b) => b.id === 'no-gender')).toBe(false);
  });
});
