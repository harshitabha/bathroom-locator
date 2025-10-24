import { useEffect, useMemo, useState, useCallback } from "react";
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

/**
 * gets all bathroom data from database
 * @returns {Place} array of Place objects
 */
function GetBathroomList() {
  const [bathrooms, setBathrooms] = useState<Place[]>([]);

  useEffect(() => {
    async function fetchBathroomData () {
      try {
        const res = await fetch('http://localhost:3000/bathroom');
        if (res.ok) {
          const bathroomData = await res.json();

          // ensure data is of correct type
          const parsedBathroomData = (bathroomData as Place[]).map(bathroom => ({
            id: bathroom.id,
            name: bathroom.name,
            position: bathroom.position,
            details: bathroom.details
          }));

          setBathrooms(parsedBathroomData);
        }
        else if (res.status === 404) {
          setBathrooms([]); // handle empty response
        }
        else {
          console.error('Error fetching bathrooms:', res.status);
        }
      } catch (error) {
        console.error('Error fetching bathrooms:', error);
      }
    }    

    fetchBathroomData();
  }, []);

  return bathrooms;
}

export default function Map() {
  // get bathroom info
  const places: Place[] = GetBathroomList();

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
