import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import "./Map.css";
import { openWalkingDirections } from '../utils/navigation';
import Button from '@mui/material/Button';


type Place = {
  id: number; // id
  name: string; // name of location
  position: google.maps.LatLngLiteral; // position on map
  details?: string; // description if needed
};

export default function Map() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!apiKey) return <p>Missing VITE_GOOGLE_MAPS_API_KEY</p>;
  return <MapInner apiKey={apiKey} />; // makes sure all react hooks are called before returning
}

function MapInner({ apiKey }: { apiKey: string }) {
  const [places, setPlaces] = useState<Place[]>([]); // bathroom info
  const [selected, setSelected] = useState<Place | null>(null); // tracks which pin is selected (which info window to show)

  // used to get map bounds
  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  // 
  const idleTimer = useRef<number | null>(null);

  // load map using api key
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  // default center coords when user doesnt provide location (somewhere in santa cruz)
  const defaultCenter = useMemo<google.maps.LatLngLiteral>(
    () => ({ lat: 36.99034408117155, lng: -122.05891223939057 }),
    []
  );

  // store user location as LatLng
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);

  // ask for user location for centering map
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported by this browser.");
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
        console.error("Geolocation error:", err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000, // times out after 10s
        maximumAge: 60_000, // saves location for 60s in browser cache
      }
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
        `http://localhost:3000/bathroom?minLng=${minLng}&minLat=${minLat}&maxLng=${maxLng}&maxLat=${maxLat}`
      );

      if (res.ok) {
        const bathroomData = await res.json();

        // ensure data is of correct type
        const parsedBathroomData = (bathroomData as Place[]).map((bathroom) => ({
          id: bathroom.id,
          name: bathroom.name,
          position: bathroom.position,
          details: bathroom.details,
        }));

        setPlaces(parsedBathroomData);
      } else if (res.status === 404) {
        setPlaces([]); // handle empty response
      } else {
        console.error("Error fetching bathrooms:", res.status);
      }
    } catch (error) {
      console.error("Error fetching bathrooms:", error);
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

  // map loading errors
  if (loadError) return <p>Failed to load Google Maps.</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <div className="map-align-center">
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
          clickableIcons: false, // prevents clicking on locations other than pins
          disableDoubleClickZoom: true, // prevents accidental zoom
          mapTypeControl: false, // prevents going to satellite mode
          mapTypeId: google.maps.MapTypeId.ROADMAP, // locks map type to simple map
          streetViewControl: false, // prevents going to streetview
          zoomControl: true, // allows zooming buttons
        }}
      >
        {places.map((p) => (
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
            onCloseClick={() => setSelected(null)} // close info window by clicking x
          >
            <div>
              <strong>{selected.name}</strong>
              {selected.details && <p>{selected.details}</p>}
              {/* TODO: add genders, amenenities, and navigate button here */}
              <Button // Get Directions button
                variant="contained"
                color="primary" // default blue unless we manually change it
                size="small"
                onClick={() => openWalkingDirections(
                  selected.position.lat,
                  selected.position.lng
                )}
              >
                Get Directions
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
