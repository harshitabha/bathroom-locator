import MapFilters, {
  type GenderFilter,
  GENDER_FILTER_OPTIONS,
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
