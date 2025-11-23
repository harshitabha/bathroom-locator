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
import AddBathroomButton from './AddBathroomButton';
import AddBathroomPeekCard from './AddBathroomPeekCard';
import AddBathroomForm from './AddBathroomForm';
import {usePinIcon} from '../utils/usePinIcon';
import MapHeader from './MapHeader';

type Place = {
  id: string;
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
  likes?: number;
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
  // select where to add new pin
  const [placePinMode, setPlacePinMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [draftPosition, setDraftPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const idleTimer = useRef<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  // holds existing bathroom data
  const [editBathroom, setEditBathroom] = useState<Place | null>(null);

  // const handleStartAddBathroom =
  // useCallback((position: google.maps.LatLngLiteral) => {
  //   setMode('add');
  //   setEditBathroom(null);
  //   setDraftPosition(position);
  //   setFormName('');
  //   setFormDescription('');
  //   setAddOpen(true);
  //   setBannerOpen(false);
  // }, []);

  const handleStartEditBathroom = useCallback((bathroom: Place) => {
    setMode('edit');
    setEditBathroom(bathroom);
    setDraftPosition(bathroom.position);
    setFormName(bathroom.name);
    setFormDescription(bathroom.description || '');
    setAddOpen(true);
    setBannerOpen(false);
  }, []);

  // used to get map bounds
  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  // load map using api key
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const pinIcon = usePinIcon(isLoaded);

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

  const handleAddButtonClick = useCallback(() => {
    setPlacePinMode(true);
    setBannerOpen(true);
    setSelected(null);
    setAddOpen(false);
    setDraftPosition(null);
    setFormName('');
    setFormDescription('');
    setMode('add');
    setEditBathroom(null);
  }, [
    setPlacePinMode, setBannerOpen, setSelected, setAddOpen, setDraftPosition,
  ]);

  // close info window when clicking off. in add mode, click drops draft pin
  const handleMapClick = useCallback(
      (e?: google.maps.MapMouseEvent) => {
        setSelected(null);
        if (placePinMode && e?.latLng) {
          setDraftPosition({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          });
          setAddOpen(true);
          setBannerOpen(false);
        }
      },
      [placePinMode],
  );

  const cancelAddFlow = useCallback(() => {
    setAddOpen(false);
    setBannerOpen(false);
    setPlacePinMode(false);
    setDraftPosition(null);
    setFormName('');
    setFormDescription('');
  }, []);

  const handleFormCloseToPrompt = useCallback(() => {
    setAddOpen(false);
    if (mode === 'add') {
      setBannerOpen(true);
    } else {
      setBannerOpen(false);
    }
  }, [mode]);

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
          `http://localhost:3000/bathroom?minLng=${minLng}&minLat=${minLat}&maxLng=${maxLng}&maxLat=${maxLat}`,
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

  // map loading errors
  if (loadError) return <p>Failed to load Google Maps.</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <div className="map-align-center">
      {isLoaded &&
        <MapHeader
          map={mapRef.current}
          bannerOpen={bannerOpen}
          onCancelBanner={cancelAddFlow}
        />
      }
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
          clickableIcons: false,
          disableDoubleClickZoom: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
        }}
      >
        {places.map((p) => (
          <Marker
            key={p.id}
            position={p.position} // position of pin
            title={p.name} // shows location name when hovering pins
            icon={pinIcon ?? undefined}
            onClick={() => setSelected(p)}
          />
        ))}

        {/* draft marker */}
        {placePinMode && draftPosition && (
          <Marker
            position={draftPosition}
            icon={pinIcon ?? undefined}
          />
        )}

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
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  handleStartEditBathroom(selected);
                  setSelected(null); // close info window
                }}
              >
                Edit
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {!placePinMode && !addOpen && (
        <AddBathroomButton onClick={handleAddButtonClick} />
      )}

      <AddBathroomPeekCard
        showPeekCard={placePinMode && !addOpen}
        onExpand={() => {
          setAddOpen(true);
          setBannerOpen(false);
        }}
      />

      <AddBathroomForm
        mode={mode}
        open={addOpen}
        position={draftPosition}
        name={formName}
        description={formDescription}
        onNameChange={setFormName}
        onDescriptionChange={setFormDescription}
        onOpen={() => {
          setBannerOpen(false);
        }}
        onClose={handleFormCloseToPrompt}
        bathroomId={editBathroom?.id}
        onCreated={async () => {
          await fetchVisiblePins();
          setAddOpen(false);
          setPlacePinMode(false);
          setBannerOpen(false);
          setDraftPosition(null);
          setFormName('');
          setFormDescription('');
        }}
        onUpdated={async () => {
          await fetchVisiblePins();
          setAddOpen(false);
          setPlacePinMode(false);
          setBannerOpen(false);
          setDraftPosition(null);
          setFormName('');
          setFormDescription('');
          setEditBathroom(null);
        }}
      />
    </div>
  );
}
