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
    screen.getByLabelText('Gender filter');
  });

  it('renders stalls filter button', () => {
    screen.getByLabelText('Stalls filter');
  });

  it('renders amenities filter button', () => {
    screen.getByLabelText('Amenities filter');
  });

  it('renders cleanliness filter button', () => {
    screen.getByLabelText('Cleanliness filter');
  });

  it('opens gender dropdown on click', async () => {
    const genderBtn = screen.getByLabelText('Gender filter');
    fireEvent.click(genderBtn);

    expect(screen.getByText(GENDER_FILTER_OPTIONS[0])).toBeInTheDocument();
  });

  it('closes gender dropdown on second click', async () => {
    const genderBtn = screen.getByLabelText('Gender filter');
    fireEvent.click(genderBtn);
    fireEvent.click(genderBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(GENDER_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });

  it('updates amenities to "2 Selected" after choosing 2 options', async () => {
    const amenitiesBtn = screen.getByLabelText('Amenities filter');
    fireEvent.click(amenitiesBtn);

    screen.getByText(AMENITIES_FILTER_OPTIONS[0]);

    fireEvent.click(screen.getByText(AMENITIES_FILTER_OPTIONS[0]));
    fireEvent.click(screen.getByText(AMENITIES_FILTER_OPTIONS[1]));

    await waitFor(() => {
      expect(screen.getByText('2 Selected')).toBeInTheDocument();
    });
  });

  it('updates "gender" to "2 Selected" after choosing 2 options', async () => {
    const genderBtn = screen.getByLabelText('Gender filter');
    fireEvent.click(genderBtn);

    screen.getByText(GENDER_FILTER_OPTIONS[0]);

    fireEvent.click(screen.getByText(GENDER_FILTER_OPTIONS[0]));
    fireEvent.click(screen.getByText(GENDER_FILTER_OPTIONS[1]));

    fireEvent.click(genderBtn);

    await waitFor(() => {
      expect(screen.getByText('2 Selected')).toBeInTheDocument();
    });
  });

  it('opens stalls dropdown after gender dropdown is closed', async () => {
    const genderBtn = screen.getByLabelText('Gender filter');
    const stallsBtn = screen.getByLabelText('Stalls filter');

    fireEvent.click(genderBtn);
    fireEvent.click(genderBtn);
    fireEvent.click(stallsBtn);

    expect(screen.getByText(STALLS_FILTER_OPTIONS[0])).toBeInTheDocument();
  });

  it('opens stalls dropdown on click', async () => {
    const stallsBtn = screen.getByLabelText('Stalls filter');
    fireEvent.click(stallsBtn);

    expect(screen.getByText(STALLS_FILTER_OPTIONS[0])).toBeInTheDocument();
  });

  it('closes stalls dropdown on second click', async () => {
    const stallsBtn = screen.getByLabelText('Stalls filter');
    fireEvent.click(stallsBtn);
    fireEvent.click(stallsBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(STALLS_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });

  it('updates "stalls" to "2 Selected" after choosing 2 options', async () => {
    const stallsBtn = screen.getByLabelText('Stalls filter');
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
    const amenitiesBtn = screen.getByLabelText('Amenities filter');
    fireEvent.click(amenitiesBtn);

    expect(screen.getByText(AMENITIES_FILTER_OPTIONS[0])).toBeInTheDocument();
  });

  it('closes amenities dropdown on second click', async () => {
    const amenitiesBtn = screen.getByLabelText('Amenities filter');
    fireEvent.click(amenitiesBtn);
    fireEvent.click(amenitiesBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(AMENITIES_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });

  it('updates clean label to "1 Selected" when choosing 1 option', async () => {
    const cleanBtn = screen.getByLabelText('Cleanliness filter');
    fireEvent.click(cleanBtn);

    await screen.findByText(CLEANLINESS_FILTER_OPTIONS[2]);

    fireEvent.click(screen.getByText(CLEANLINESS_FILTER_OPTIONS[2]));

    fireEvent.click(cleanBtn);

    await waitFor(() => {
      expect(screen.getByText('1 Selected')).toBeInTheDocument();
    });
  });

  it('opens cleanliness dropdown on click', async () => {
    const cleanBtn = screen.getByLabelText('Cleanliness filter');
    fireEvent.click(cleanBtn);

    expect(screen.getByText(CLEANLINESS_FILTER_OPTIONS[0])).toBeInTheDocument();
  });

  it('closes cleanliness dropdown on second click', async () => {
    const cleanBtn = screen.getByLabelText('Cleanliness filter');
    fireEvent.click(cleanBtn);
    fireEvent.click(cleanBtn);

    await waitFor(() => {
      expect(
          screen.queryByText(CLEANLINESS_FILTER_OPTIONS[0]),
      ).not.toBeInTheDocument();
    });
  });
});
