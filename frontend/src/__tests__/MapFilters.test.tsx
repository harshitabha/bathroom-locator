import MapFilters, {
  type GenderFilter,
  type StallsFilter,
  type AmenityFilter,
  type CleanlinessFilter,
  GENDER_FILTER_OPTIONS,
  STALLS_FILTER_OPTIONS,
  AMENITIES_FILTER_OPTIONS,
  CLEANLINESS_FILTER_OPTIONS,
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

const FiltersHarness: React.FC = () => {
  const [selectedGenders, setSelectedGenders] = React.useState<GenderFilter[]>(
      [],
  );
  const [selectedStalls, setSelectedStalls] = React.useState<StallsFilter[]>(
      [],
  );
  const [selectedAmenities, setSelectedAmenities] =
    React.useState<AmenityFilter[]>([]);
  const [selectedCleanliness, setSelectedCleanliness] =
    React.useState<CleanlinessFilter[]>([]);

  return (
    <MapFilters
      selectedGenders={selectedGenders}
      selectedStalls={selectedStalls}
      selectedAmenities={selectedAmenities}
      selectedCleanliness={selectedCleanliness}
      onGendersChange={(next) => setSelectedGenders(next)}
      onStallsChange={(next) => setSelectedStalls(next)}
      onAmenitiesChange={(next) => setSelectedAmenities(next)}
      onCleanlinessChange={(next) => setSelectedCleanliness(next)}
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
    const genderBtn = screen.getByTestId('filter-gender');
    expect(genderBtn).toBeInTheDocument();
  });

  it('renders stalls filter button', () => {
    const stallsBtn = screen.getByTestId('filter-stalls');
    expect(stallsBtn).toBeInTheDocument();
  });

  it('renders amenities filter button', () => {
    const amenitiesBtn = screen.getByTestId('filter-amenities');
    expect(amenitiesBtn).toBeInTheDocument();
  });

  it('renders cleanliness filter button', () => {
    const cleanlinessBtn = screen.getByTestId('filter-cleanliness');
    expect(cleanlinessBtn).toBeInTheDocument();
  });

  it('opens gender dropdown on click', async () => {
    const genderBtn = screen.getByTestId('filter-gender');
    fireEvent.click(genderBtn);

    expect(
        await screen.findByText(GENDER_FILTER_OPTIONS[0]),
    ).toBeInTheDocument();
  });

  it('closes gender dropdown on second click', async () => {
    const genderBtn = screen.getByTestId('filter-gender');
    fireEvent.click(genderBtn);
    fireEvent.click(genderBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(GENDER_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });

  it('updates amenities to "2 Selected" after choosing 2 options', async () => {
    const amenitiesBtn = screen.getByTestId('filter-amenities');
    fireEvent.click(amenitiesBtn);

    await screen.findByText(AMENITIES_FILTER_OPTIONS[0]);

    fireEvent.click(screen.getByText(AMENITIES_FILTER_OPTIONS[0]));
    fireEvent.click(screen.getByText(AMENITIES_FILTER_OPTIONS[1]));

    // close the dropdown so the label updates
    fireEvent.click(amenitiesBtn);

    await waitFor(() => {
      expect(screen.getByText('2 Selected')).toBeInTheDocument();
    });
  });

  it('updates "gender" to "2 Selected" after choosing 2 options', async () => {
    const genderBtn = screen.getByTestId('filter-gender');
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
    const genderBtn = screen.getByTestId('filter-gender');
    const stallsBtn = screen.getByTestId('filter-stalls');

    fireEvent.click(genderBtn);
    fireEvent.click(genderBtn);
    fireEvent.click(stallsBtn);

    expect(
        await screen.findByText(STALLS_FILTER_OPTIONS[0]),
    ).toBeInTheDocument();
  });

  it('opens stalls dropdown on click', async () => {
    const stallsBtn = screen.getByTestId('filter-stalls');
    fireEvent.click(stallsBtn);

    expect(
        await screen.findByText(STALLS_FILTER_OPTIONS[0]),
    ).toBeInTheDocument();
  });

  it('closes stalls dropdown on second click', async () => {
    const stallsBtn = screen.getByTestId('filter-stalls');
    fireEvent.click(stallsBtn);
    fireEvent.click(stallsBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(STALLS_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });

  it('updates "stalls" to "2 Selected" after choosing 2 options', async () => {
    const stallsBtn = screen.getByTestId('filter-stalls');
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
    const amenitiesBtn = screen.getByTestId('filter-amenities');
    fireEvent.click(amenitiesBtn);

    expect(
        await screen.findByText(AMENITIES_FILTER_OPTIONS[0]),
    ).toBeInTheDocument();
  });

  it('closes amenities dropdown on second click', async () => {
    const amenitiesBtn = screen.getByTestId('filter-amenities');
    fireEvent.click(amenitiesBtn);
    fireEvent.click(amenitiesBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(AMENITIES_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });

  it('updates clean label to "1 Selected" when choosing 1 option', async () => {
    const cleanBtn = screen.getByTestId('filter-cleanliness');
    fireEvent.click(cleanBtn);

    await screen.findByText(CLEANLINESS_FILTER_OPTIONS[2]);

    fireEvent.click(screen.getByText(CLEANLINESS_FILTER_OPTIONS[2]));

    // close the dropdown so the label updates
    fireEvent.click(cleanBtn);

    await waitFor(() => {
      expect(screen.getByText('1 Selected')).toBeInTheDocument();
    });
  });

  it('opens cleanliness dropdown on click', async () => {
    const cleanBtn = screen.getByTestId('filter-cleanliness');
    fireEvent.click(cleanBtn);

    expect(
        await screen.findByText(CLEANLINESS_FILTER_OPTIONS[0]),
    ).toBeInTheDocument();
  });

  it('closes cleanliness dropdown on second click', async () => {
    const cleanBtn = screen.getByTestId('filter-cleanliness');
    fireEvent.click(cleanBtn);
    fireEvent.click(cleanBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(CLEANLINESS_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });
});
