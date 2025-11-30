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
import SearchBar from '../components/SearchBar';

// mocks & types

type MockPlace = {
  fetchFields: (opts: { fields: string[] }) => Promise<void>;
  location?: unknown;
};

type MockPrediction = {
  placeId: string;
  text: { toString(): string };
  structuredFormat?: {
    secondaryText?: { toString(): string };
  };
  toPlace?: () => MockPlace;
};

type MockSuggestion = {
  placePrediction: MockPrediction;
};

type FetchAutocompleteSuggestions = (request: {
  input: string;
  locationBias?: unknown;
  sessionToken?: unknown;
}) => Promise<{ suggestions: MockSuggestion[] }>;

type GoogleWithPlaces = {
  maps: {
    importLibrary: (libraryName: string) => Promise<unknown>;
  };
};

const importLibraryMock = vi.fn<GoogleWithPlaces['maps']['importLibrary']>();
const fetchAutocompleteSuggestionsMock =
  vi.fn<FetchAutocompleteSuggestions>();

beforeEach(() => {
  (globalThis as { google: GoogleWithPlaces }).google = {
    maps: {
      importLibrary: importLibraryMock,
    },
  };

  importLibraryMock.mockResolvedValue({
    AutocompleteSessionToken: vi.fn(),
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions: fetchAutocompleteSuggestionsMock,
    },
  });

  fetchAutocompleteSuggestionsMock.mockResolvedValue({
    suggestions: [],
  });
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

// tests

describe('SearchBar', () => {
  it('renders the search input and button', () => {
    render(<SearchBar map={null} />);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('search')).toBeInTheDocument();
  });

  it('loads the Places library', async () => {
    render(<SearchBar map={null} />);

    await waitFor(() => {
      expect(importLibraryMock).toHaveBeenCalledWith('places');
    });
  });

  it('calls Places and renders suggestions', async () => {
    const suggestion: MockSuggestion = {
      placePrediction: {
        placeId: 'test-place-id',
        text: {toString: () => 'Bathroom One'},
        structuredFormat: {
          secondaryText: {toString: () => '123 Campus Rd'},
        },
      },
    };

    fetchAutocompleteSuggestionsMock.mockResolvedValueOnce({
      suggestions: [suggestion],
    });

    render(<SearchBar map={null} />);

    const input = screen.getByPlaceholderText('Search');
    const button = screen.getByLabelText('search');

    fireEvent.change(input, {target: {value: 'bathroom'}});
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchAutocompleteSuggestionsMock).toHaveBeenCalledTimes(1);
    });

    const req = fetchAutocompleteSuggestionsMock.mock.calls[0]?.[0];

    expect(req).toMatchObject({input: 'bathroom'});
    expect(req.sessionToken).toBeDefined();
    expect(await screen.findByText('Bathroom One')).toBeInTheDocument();
    expect(screen.getByText('123 Campus Rd')).toBeInTheDocument();
  });

  it('debounces calls to getPredictions when typing', async () => {
    render(<SearchBar map={null} />);

    const input = screen.getByPlaceholderText('Search');

    fireEvent.change(input, {target: {value: 'b'}});
    fireEvent.change(input, {target: {value: 'ba'}});
    fireEvent.change(input, {target: {value: 'bathroom'}});

    await waitFor(
        () => {
          expect(fetchAutocompleteSuggestionsMock).toHaveBeenCalledTimes(1);
          expect(fetchAutocompleteSuggestionsMock).toHaveBeenCalledWith(
              expect.objectContaining({input: 'bathroom'}),
          );
        },
        {timeout: 1000},
    );
  });

  it('does not call Places when search is empty', () => {
    render(<SearchBar map={null} />);

    const button = screen.getByLabelText('search');

    fireEvent.click(button);

    expect(fetchAutocompleteSuggestionsMock).not.toHaveBeenCalled();
  });

  it('calls Places when pressing enter', async () => {
    render(<SearchBar map={null} />);

    const input = screen.getByPlaceholderText('Search');

    fireEvent.change(input, {target: {value: 'bathroom'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    await waitFor(() => {
      expect(fetchAutocompleteSuggestionsMock).toHaveBeenCalledTimes(1);
      expect(fetchAutocompleteSuggestionsMock).toHaveBeenCalledWith(
          expect.objectContaining({input: 'bathroom'}),
      );
    });
  });

  it('pans the map when a suggestion is clicked', async () => {
    const place: MockPlace = {
      fetchFields: vi.fn().mockResolvedValue(undefined),
      location: {lat: 37.0, lng: -122.0},
    };

    const suggestion: MockSuggestion = {
      placePrediction: {
        placeId: 'place-1',
        text: {toString: () => 'Bathroom One'},
        structuredFormat: {
          secondaryText: {toString: () => '123 Campus Rd'},
        },
        toPlace: () => place,
      },
    };

    fetchAutocompleteSuggestionsMock.mockResolvedValueOnce({
      suggestions: [suggestion],
    });

    const panToMock = vi.fn();
    const setZoomMock = vi.fn();
    const getBoundsMock = vi.fn(() => ({toJSON: () => undefined}));

    const map = {
      panTo: panToMock,
      setZoom: setZoomMock,
      getBounds: getBoundsMock,
    } as unknown as google.maps.Map;

    render(<SearchBar map={map} />);

    const input = screen.getByPlaceholderText('Search');
    const button = screen.getByLabelText('search');

    fireEvent.change(input, {target: {value: 'bathroom'}});
    fireEvent.click(button);

    const suggestionItem = await screen.findByText('Bathroom One');

    const clickable = suggestionItem.closest('button') ?? suggestionItem;
    fireEvent.click(clickable);

    await waitFor(() => {
      expect(panToMock).toHaveBeenCalledTimes(1);
      expect(setZoomMock).toHaveBeenCalledWith(14);
    });

    await waitFor(() => {
      expect(screen.queryByText('Bathroom One')).toBeNull();
    });

    expect(
        (screen.getByPlaceholderText('Search') as HTMLInputElement).value,
    ).toBe('Bathroom One');
  });

  it('clears suggestions and closes list when input is cleared', async () => {
    const suggestion: MockSuggestion = {
      placePrediction: {
        placeId: 's1',
        text: {toString: () => 'Bathroom One'},
        structuredFormat: {
          secondaryText: {toString: () => '123 Campus Rd'},
        },
      },
    };

    fetchAutocompleteSuggestionsMock.mockResolvedValueOnce({
      suggestions: [suggestion],
    });

    render(<SearchBar map={null} />);

    const input = screen.getByPlaceholderText('Search');
    const button = screen.getByLabelText('search');

    fireEvent.change(input, {target: {value: 'bathroom'}});
    fireEvent.click(button);

    const suggestionItem = await screen.findByText('Bathroom One');
    expect(suggestionItem).toBeInTheDocument();

    fireEvent.change(input, {target: {value: ''}});

    await waitFor(() => {
      expect(screen.queryByText('Bathroom One')).toBeNull();
    });
  });

  it('closes suggestions when pressing Escape', async () => {
    fetchAutocompleteSuggestionsMock.mockResolvedValueOnce({
      suggestions: [{
        placePrediction: {
          placeId: 'esc',
          text: {toString: () => 'test'},
        },
      }],
    });

    render(<SearchBar map={null} />);

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, {target: {value: 'bathroom'}});
    fireEvent.click(screen.getByLabelText('search'));
    fireEvent.keyDown(input, {key: 'Escape'});

    await waitFor(() => {
      expect(screen.queryByText('test')).toBeNull();
    });
  });

  it('reopens same suggestion list after closing', async () => {
    fetchAutocompleteSuggestionsMock.mockResolvedValueOnce({
      suggestions: [{
        placePrediction: {
          placeId: 'esc',
          text: {toString: () => 'test'},
        },
      }],
    });

    render(<SearchBar map={null} />);

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, {target: {value: 'bathroom'}});
    fireEvent.click(screen.getByLabelText('search'));
    fireEvent.keyDown(input, {key: 'Escape'});
    fireEvent.focus(input);

    await screen.findByText('test');
  });

  it('does not pan when place has no location', async () => {
    const place = {
      fetchFields: vi.fn().mockResolvedValue(undefined),
      location: undefined,
    };

    fetchAutocompleteSuggestionsMock.mockResolvedValueOnce({
      suggestions: [{
        placePrediction: {
          placeId: 'nl',
          text: {toString: () => 'No Location'},
          structuredFormat: {secondaryText: {toString: () => ''}},
          toPlace: () => place,
        },
      }],
    });

    const panTo = vi.fn();

    const map = {
      panTo,
      setZoom: () => {},
      getBounds: () => ({
        toJSON: () => ({}),
      }),
    } as unknown as google.maps.Map;

    render(<SearchBar map={map} />);

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, {target: {value: 'bathroom'}});
    fireEvent.click(screen.getByLabelText('search'));

    await fireEvent.click(await screen.findByLabelText('No Location'));

    expect(panTo).not.toHaveBeenCalled();
  });

  it('Only calls api once after searching twice with same input', async () => {
    fetchAutocompleteSuggestionsMock.mockResolvedValueOnce({
      suggestions: [{
        placePrediction: {
          placeId: 'x',
          text: {toString: () => 'Test'},
        },
      }],
    });

    render(<SearchBar map={null} />);

    const input = screen.getByPlaceholderText('Search');
    const searchButton = screen.getByLabelText('search');

    fireEvent.change(input, {target: {value: 'a'}});
    fireEvent.click(searchButton);

    await screen.findByText('Test');

    fireEvent.click(searchButton);

    expect(fetchAutocompleteSuggestionsMock).toHaveBeenCalledTimes(1);
  });
});
