import {useState, useRef, useEffect, useCallback} from 'react';
import {ClickAwayListener, Divider, Box, Paper, TextField, List,
  ListItemButton, ListItemText, InputAdornment, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// helper types
type PlacePrediction = google.maps.places.PlacePrediction;
type PlacePredictionWithFormat = PlacePrediction & {
  structuredFormat?: {
    secondaryText?: {
      toString: () => string;
    };
  };
};
type Suggestion = google.maps.places.AutocompleteSuggestion;
// guaranteed to have a pred
type SugWithPred = Suggestion & { placePrediction: PlacePrediction };

type Props = { map: google.maps.Map | null };

const SearchBar = ({map}: Props) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [suggestions, setSuggestions] = useState<SugWithPred[]>([]);

  // One session token per typing session
  const tokenRef = useRef<
    google.maps.places.AutocompleteSessionToken | null
  >(null);

  // 250ms delay to prevent excess api calls
  const debounceRef = useRef<number | null>(null);
  const clearDebounce = () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = null;
  };

  // Load new places api once and create a token
  useEffect(() => {
    let mounted = true;
    (async () => {
      const placesLib = (
        await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
      if (!mounted) return;
      tokenRef.current = new placesLib.AutocompleteSessionToken();
    })();
    return () => {
      mounted = false;
      clearDebounce();
    };
  }, []);

  // i hate places api
  const getPredictions = useCallback( async (text: string) => {
    setLoading(true);
    try {
      const placesLib = (
        await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
      const {AutocompleteSuggestion} = placesLib;

      // used to create suggestion bias based on current map location
      const bounds = map?.getBounds?.()?.toJSON();

      const req: google.maps.places.AutocompleteRequest = {
        input: text,
        locationBias: bounds,
        sessionToken: tokenRef.current ?? undefined,
      };

      const {suggestions} = (
        await AutocompleteSuggestion.fetchAutocompleteSuggestions(req)) ?? {};

      // only keep the suggestions with places
      const list: SugWithPred[] = (suggestions ?? []).filter(
          (s): s is SugWithPred => !!s.placePrediction,
      );

      setSuggestions(list);
      setOpenList(list.length > 0);
    } finally {
      setLoading(false);
    }
  }, [map]);

  const handleChange = (v: string) => {
    setSearch(v);
    clearDebounce();
    if (!v.trim()) {
      setSuggestions([]);
      setOpenList(false);
      return;
    }
    debounceRef.current = window.setTimeout(() => void getPredictions(v), 250);
  };

  // Pan to a chosen place
  const panToPrediction = useCallback( async (pred: PlacePrediction) => {
    if (!map) return;
    const placesLib = (
      await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;

    const place = pred.toPlace();
    await place.fetchFields(
        {fields: ['location', 'displayName', 'formattedAddress']});

    if (place.location) {
      map.panTo(place.location);
      map.setZoom(14);
    }

    tokenRef.current = new placesLib.AutocompleteSessionToken();
  }, [map]);

  // user picks a autocomplete result, update search bar and moves map
  const handlePick = async (s: SugWithPred) => {
    const pred = s.placePrediction;
    setSearch(pred.text.toString());
    setOpenList(false);
    setSuggestions([]);
    await panToPrediction(pred);
  };

  // go to top autocomplete result if there is one or use text from search bar
  const handleSearch = () => {
    if (loading) return;
    if (suggestions.length) {
      void handlePick(suggestions[0]);
    } else if (search.trim()) {
      void getPredictions(search.trim());
    }
  };

  return (
    <ClickAwayListener onClickAway={() => setOpenList(false)}>
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: '100%',
          padding: 0.5,
          borderRadius: 6,
          boxSizing: 'border-box',
        }}
      >
        <TextField
          autoComplete="off"
          value={search}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpenList(suggestions.length > 0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
              setOpenList(false);
            } else if (e.key === 'Escape') {
              setOpenList(false);
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          fullWidth
          size="small"
          placeholder="Search"
          variant="standard"
          slotProps={{
            input: {
              style: {paddingLeft: 14},
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="search" onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {openList && <Divider sx={{mt: 1, opacity: 0.6}} />}

        {/* list of autocomplete results */}
        {openList && suggestions.length > 0 && (
          <Box
            sx={{
              mt: 1,
              maxHeight: 275,
              overflowY: 'auto',
              boxShadow: 'none',
              backgroundColor: 'transparent',
              p: 0,
            }}
          >
            <List dense disablePadding>
              {suggestions.map((s, index) => {
                const pred = s.placePrediction as PlacePredictionWithFormat;
                const primary = pred.text?.toString?.() ?? '';
                const structured = pred.structuredFormat;
                const secondary = structured?.secondaryText?.toString?.();

                return (
                  <ListItemButton
                    key={pred.placeId}
                    aria-label={primary}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => void handlePick(s)}
                    sx={{
                      px: 1.25,
                      backgroundColor: 'transparent',
                      borderTop: index === 0 ?
                      'none' : '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <ListItemText primary={primary} secondary={secondary} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        )}
      </Paper>
    </ClickAwayListener>
  );
};
export default SearchBar;
