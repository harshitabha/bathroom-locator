import MapFilters, {
  type GenderFilter,
  type StallsFilter,
  type AmenityFilter,
  GENDER_FILTER_OPTIONS,
  STALLS_FILTER_OPTIONS,
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

const GENDER_FILTER_LABEL = 'Gender filter';
const STALLS_FILTER_LABEL = 'Stalls filter';
const AMENITIES_FILTER_LABEL = 'Amenities filter';

const FiltersHarness: React.FC = () => {
  const [selectedGenders, setSelectedGenders] = React.useState<GenderFilter[]>(
      [],
  );
  const [selectedStalls, setSelectedStalls] = React.useState<StallsFilter[]>(
      [],
  );
  const [selectedAmenities, setSelectedAmenities] =
    React.useState<AmenityFilter[]>([]);

  return (
    <MapFilters
      selectedGenders={selectedGenders}
      selectedStalls={selectedStalls}
      selectedAmenities={selectedAmenities}
      onGendersChange={(next) => setSelectedGenders(next)}
      onStallsChange={(next) => setSelectedStalls(next)}
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
  it('renders gender filter button', () => {
    expect(
        screen.getByLabelText(GENDER_FILTER_LABEL),
    ).toBeInTheDocument();
  });

  it('renders stalls filter button', () => {
    expect(
        screen.getByLabelText(STALLS_FILTER_LABEL),
    ).toBeInTheDocument();
  });

  it('renders amenities filter button', () => {
    expect(
        screen.getByLabelText(AMENITIES_FILTER_LABEL),
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

  it('updates amenities to "2 Selected" after choosing 2 options', async () => {
    const amenitiesBtn = screen.getByLabelText(AMENITIES_FILTER_LABEL);
    fireEvent.click(amenitiesBtn);

    fireEvent.click(screen.getByText(AMENITIES_FILTER_OPTIONS[0]));
    fireEvent.click(screen.getByText(AMENITIES_FILTER_OPTIONS[1]));

    await waitFor(() => {
      expect(screen.getByText('2 Selected')).toBeInTheDocument();
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

  it('opens stalls dropdown after gender dropdown is closed', async () => {
    const genderBtn = screen.getByLabelText(GENDER_FILTER_LABEL);
    const stallsBtn = screen.getByLabelText(STALLS_FILTER_LABEL);

    fireEvent.click(genderBtn);
    fireEvent.click(genderBtn);
    fireEvent.click(stallsBtn);

    expect(
        await screen.findByText(STALLS_FILTER_OPTIONS[0]),
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
});
