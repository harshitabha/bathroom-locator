import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef} from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from '@react-google-maps/api';
import './Map.css';
import {openWalkingDirections} from '../utils/navigation';
import Button from '@mui/material/Button';
import MapHeader from './MapHeader';
import MapFilters, {
  type GenderFilter,
  type StallsFilter,
  type AmenityFilter,
  type CleanlinessFilter,
} from './MapFilters';

type Place = {
  id: number;
  name: string;
  position: google.maps.LatLngLiteral;
  description?: string;
  numStalls?: number;
  amenities?: {
    toilet_paper?: boolean;
    soap?: boolean;
    paper_towel?: boolean;
    hand_dryer?: boolean;
    menstrual_products?: boolean;
    mirror?: boolean;
  };
  gender?: {
    female?: boolean;
    male?: boolean;
    gender_neutral?: boolean;
  };
  cleanliness?: number;
};

const Map = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!apiKey) return <p>Missing VITE_GOOGLE_MAPS_API_KEY</p>;
  // makes sure all react hooks are called before returning
  return <MapInner apiKey={apiKey} />;
};
export default Map;

/**
 * Renders the actual content of the map
 * @param {string} apiKey api key for the map
 * @returns {object} JSX compoent for the inner map content
 */
function MapInner({apiKey}: { apiKey: string }) {
  const [places, setPlaces] = useState<Place[]>([]); // bathroom info
  // tracks which pin is selected (which info window to show)
  const [selected, setSelected] = useState<Place | null>(null);
  const [selectedGenders, setSelectedGenders] = useState<GenderFilter[]>([]);
  const [selectedStalls, setSelectedStalls] = useState<StallsFilter[]>([]);
  const [selectedAmenities, setSelectedAmenities] =
    useState<AmenityFilter[]>([]);
  const [selectedCleanliness, setSelectedCleanliness] =
    useState<CleanlinessFilter[]>([]);

  // used to get map bounds
  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  //
  const idleTimer = useRef<number | null>(null);

  // load map using api key
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  // default center coords when user doesn't provide location
  // (somewhere in santa cruz)
  const defaultCenter = useMemo<google.maps.LatLngLiteral>(
      () => ({lat: 36.99034408117155, lng: -122.05891223939057}),
      [],
  );

  // store user location as LatLng
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);

  // ask for user location for centering map
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error('Geolocation error:', err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10_000, // times out after 10s
          maximumAge: 60_000, // saves location for 60s in browser cache
        },
    );
  }, []);

  // center map on user if location is given, else default on santa cruz
  const center = userLocation ?? defaultCenter;

  // close info window when clicking off
  const handleMapClick = useCallback(() => setSelected(null), []);

  // fetch bathroom pins within the current map view + some padding
  const fetchVisiblePins = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // small padding so tiny movements dont refetch
    const pad = 0.1; // about 5 to 7 miles
    const minLng = sw.lng() - pad;
    const minLat = sw.lat() - pad;
    const maxLng = ne.lng() + pad;
    const maxLat = ne.lat() + pad;

    try {
      const res = await fetch(
          `http://localhost:3000/bathroom?minLng=${minLng}` +
          `&minLat=${minLat}&maxLng=${maxLng}&maxLat=${maxLat}` +
          `&limit=200`,
      );

      if (res.ok) {
        const bathroomData = await res.json();

        // ensure data is of correct type
        const parsedBathroomData = (bathroomData as Place[])
            .map((bathroom) => ({
              id: bathroom.id,
              name: bathroom.name,
              position: bathroom.position,
              description: bathroom.description,
              numStalls: (bathroom as Place).numStalls,
              amenities: (bathroom as Place).amenities,
              gender: (bathroom as Place).gender,
              cleanliness: (bathroom as Place).cleanliness,
            }));

        setPlaces(parsedBathroomData);
      } else if (res.status === 404) {
        setPlaces([]); // handle empty response
      } else {
        console.error('Error fetching bathrooms:', res.status);
      }
    } catch (error) {
      console.error('Error fetching bathrooms:', error);
    }
  }, []);

  // fetches pins after 250ms of idling. If user moves before, reset timer
  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      window.clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  const handleIdle = useCallback(() => {
    clearIdleTimer();
    idleTimer.current = window.setTimeout(fetchVisiblePins, 250);
  }, [fetchVisiblePins, clearIdleTimer]);

  const handleDragStart = useCallback(() => {
    clearIdleTimer();
  }, [clearIdleTimer]);

  const handleZoomChange = useCallback(() => {
    clearIdleTimer();
  }, [clearIdleTimer]);

  // for long polling to get real-time updates
  useEffect(( ) => {
    let cancelled = false;

    /**
     * Polls the new bathrooms if they are added
     */
    async function pollNewBathrooms() {
      if (cancelled) return;

      try {
        const res = await fetch('http://localhost:3000/bathroom/updates');
        if (!res.ok) {
          console.error('Polling error:', res.status);
        }

        const newBathrooms: Place[] = await res.json();

        if (newBathrooms.length > 0 && mapRef.current) {
          const bounds = mapRef.current.getBounds();
          if (bounds) {
            // filter new bathrooms to only those within current map bounds
            const visibleNewBathrooms = newBathrooms.filter((bathroom) => {
              const pos = new google.maps.LatLng(
                  bathroom.position.lat,
                  bathroom.position.lng,
              );
              return bounds.contains(pos);
            });
            if (visibleNewBathrooms.length > 0) {
              setPlaces((prevPlaces) => [
                ...prevPlaces,
                ...visibleNewBathrooms.filter((nb) =>
                  !prevPlaces.some((p) => p.id === nb.id),
                ),
              ]);
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        // wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } finally {
        if (!cancelled) pollNewBathrooms();
      }
    }
    pollNewBathrooms();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPlaces = useMemo(() => {
    const genderKeys: Record<
      GenderFilter,
      keyof NonNullable<Place['gender']>
    > = {
      'Male': 'male',
      'Female': 'female',
      'Gender Neutral': 'gender_neutral',
    };

    const stallsMatch = (s?: number) => {
      if (!selectedStalls.length) return true;
      if (!s && s !== 0) return false;
      const options = new Set(selectedStalls);
      if (options.has('Private') && s === 1) return true;
      if (options.has('2') && s === 2) return true;
      if (options.has('3') && s === 3) return true;
      if (options.has('4+') && s >= 4) return true;
      return false;
    };

    const amenitiesMatch = (a?: Place['amenities']) => {
      if (!selectedAmenities.length) return true;
      if (!a) return false;
      const need: Record<AmenityFilter, boolean> = {
        'Soap': !!a.soap,
        'Tissues': !!a.paper_towel,
        'Menstrual Products': !!a.menstrual_products,
        'Mirror': !!a.mirror,
        'Toilet Paper': !!a.toilet_paper,
        'Hand Dryer': !!a.hand_dryer,
      };
      return selectedAmenities.every((k) => need[k]);
    };

    const genderMatch = (g?: Place['gender']) => {
      if (!selectedGenders.length) return true;
      if (!g) return false;
      return selectedGenders.some((opt) => !!g[genderKeys[opt]]);
    };

    const selectedNums = new Set(
        selectedCleanliness.map((v) => parseInt(v, 10)),
    );

    const cleanlinessMatch = (c?: number) => {
      if (!selectedCleanliness.length) return true;
      const cNum = typeof c === 'number' ? c : parseInt(String(c ?? ''), 10);
      if (Number.isNaN(cNum)) return false;
      return selectedNums.has(cNum);
    };

    const matches = (p: Place) =>
      genderMatch(p.gender) &&
      stallsMatch(p.numStalls) &&
      amenitiesMatch(p.amenities) &&
      cleanlinessMatch(p.cleanliness);

    return places.filter(matches);
  }, [
    places,
    selectedGenders,
    selectedStalls,
    selectedAmenities,
    selectedCleanliness,
  ]);

  // map loading errors
  if (loadError) return <p>Failed to load Google Maps.</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <div className="map-align-center">
      {isLoaded && <MapHeader map={mapRef.current} />}
      <GoogleMap
        onLoad={onMapLoad}
        onIdle={handleIdle}
        onDragStart={handleDragStart}
        onZoomChanged={handleZoomChange}
        mapContainerClassName="map-container"
        center={center}
        zoom={14}
        onClick={handleMapClick}
        options={{
          // prevents clicking on locations other than pins
          clickableIcons: false,
          disableDoubleClickZoom: true, // prevents accidental zoom
          // locks map type to simple map
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
        }}
      >
        {filteredPlaces.map((p) => (
          <Marker
            key={p.id}
            position={p.position} // position of pin
            title={p.name} // shows location name when hovering pins
            onClick={() => setSelected(p)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={selected.position}
            // close info window by clicking x
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <strong>{selected.name}</strong>
              {selected.description && <p>{selected.description}</p>}
              {/* TODO: add genders, amenenities, and navigate button here */}
              <Button // Get Directions button
                variant="contained"
                color="primary" // default blue unless we manually change it
                size="small"
                onClick={() => openWalkingDirections(
                    selected.position.lat,
                    selected.position.lng,
                )}
              >
                Get Directions
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <MapFilters
        selectedGenders={selectedGenders}
        selectedStalls={selectedStalls}
        selectedAmenities={selectedAmenities}
        selectedCleanliness={selectedCleanliness}
        onGendersChange={setSelectedGenders}
        onStallsChange={setSelectedStalls}
        onAmenitiesChange={setSelectedAmenities}
        onCleanlinessChange={setSelectedCleanliness}
      />
    </div>
  );
}
