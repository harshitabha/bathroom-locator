import { useEffect, useMemo, useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import "./Map.css";
import { openWalkingDirections } from '../utils/navigation';


type Place = {
  id: number; // id
  name: string; // name of location
  position: google.maps.LatLngLiteral; // position on map
  details?: string; // description if needed
};

// using array of positions for now
// TODO: replace with backend stuff
const places: Place[] = [
  {
    id: 1,
    name: "Place 1",
    position: { lat: 36.98748976644447, lng: -122.05266989826008 },
    details: "details for place 1",
  },
  {
    id: 2,
    name: "Place 2",
    position: { lat: 36.983699950790374, lng: -122.06109301687917 },
    details: "details for place 2",
  },
  {
    id: 3,
    name: "Place 3",
    position: { lat: 36.999252674980575, lng: -122.06119631097208 },
    details: "details for place 3",
  },
  {
    id: 4,
    name: "Place 4",
    position: { lat: 36.97333960932408, lng: -122.04776108433727 },
    details: "details for place 4",
  },
  {
    id: 5,
    name: "Place 5",
    position: { lat: 36.97603698082977, lng: -122.0287297471338 },
    details: "details for place 5",
  },
];

export default function Map() {
  // get api key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  if (!apiKey) return <p>Missing VITE_GOOGLE_MAPS_API_KEY</p>;

  // load map using api key
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"], // TODO: use this to look up places
  });

  // default center coords when user doesnt provide location (somewhere in santa cruz)
  const defaultCenter = useMemo(
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

  // tracks which pin is selected (which info window to show)
  const [selected, setSelected] = useState<Place | null>(null);

  // close info window when clicking off
  const handleMapClick = useCallback(() => setSelected(null), []);

  // map loading errors
  if (loadError) return <p>Failed to load Google Maps.</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <div className="map-align-center">
      <GoogleMap
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
              <button // navigate button
                onClick={() =>
                  openWalkingDirections(
                    selected.position.lat,
                    selected.position.lng
                  )
                }
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Get Directions
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
