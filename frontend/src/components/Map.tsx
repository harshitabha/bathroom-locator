import "./Map.css";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { openWalkingDirections } from "../utils/navigation";
import AddBathroom from "./AddBathroom";
import AddBathroomPrompt from './AddBathroomPrompt';
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

type Place = {
  id: number;
  name: string;
  position: google.maps.LatLngLiteral;
  details?: string;
};

export default function Map() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!apiKey) return <p>Missing VITE_GOOGLE_MAPS_API_KEY</p>;
  return <MapInner apiKey={apiKey} />;
}

function MapInner({ apiKey }: { apiKey: string }) {
  const theme = useTheme();
  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [draftPosition, setDraftPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [formName, setFormName] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [resetToken, setResetToken] = useState(0);
  const startYRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const onPeekTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation(); 
    startYRef.current = e.touches[0].clientY;
    draggingRef.current = true;
  };

  const onPeekTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation(); 
    if (!draggingRef.current || startYRef.current == null) return;
    const dy = startYRef.current - e.changedTouches[0].clientY;
    if (dy > 20) {
      setAddOpen(true);
      setBannerOpen(false);
    }
    startYRef.current = null;
    draggingRef.current = false;
  };

  // Desktop testing helper
  const onPeekMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation(); 
    startYRef.current = e.clientY;
    draggingRef.current = true;
    const onUp = (ev: MouseEvent) => {
      ev.stopPropagation?.();
      if (draggingRef.current && startYRef.current != null) {
        const dy = startYRef.current - ev.clientY;
        if (dy > 20) {
          setAddOpen(true);
          setBannerOpen(false);
        }
      }
      startYRef.current = null;
      draggingRef.current = false;
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mouseup", onUp);
  };

  // used to get map bounds
  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const idleTimer = useRef<number | null>(null);

  // load map using api key
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const pinIcon = React.useMemo(() => {
    if (!isLoaded || !window.google) return null;
    const g = window.google;
    const pinColor = theme.palette.secondary.main;
    const innerColor = theme.palette.common.white;
    return {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
          <svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C7 0 0 7 0 15c0 11.25 15 30 15 30s15-18.75 15-30C30 7 23 0 15 0z" fill="${pinColor}"/>
            <circle cx="15" cy="15" r="6" fill="${innerColor}"/>
          </svg>
        `),
      scaledSize: new g.maps.Size(20, 30),
      anchor: new g.maps.Point(10, 30),
    } as google.maps.Icon;
  }, [isLoaded, theme]);

  // default center coords when user doesn't allow location (somewhere in santa cruz)
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
        timeout: 10_000,
        maximumAge: 60_000,
      }
    );
  }, []);

  // center map on user if location is given, else default on santa cruz
  const center = userLocation ?? defaultCenter;

  // close info window when clicking off; in add mode, click drops draft pin and opens sheet
  const handleMapClick = useCallback(
    (e?: google.maps.MapMouseEvent) => {
      setSelected(null);
      if (addMode && e?.latLng) {
        setDraftPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        setAddOpen(true);
        setBannerOpen(false);
      }
    },
    [addMode]
  );

  const cancelAddFlow = useCallback(() => {
    setAddOpen(false);
    setBannerOpen(false);
    setAddMode(false);
    setDraftPosition(null);
    setFormName("");
    setFormDetails("");
  }, []);

  // fetch bathroom pins within the current map view
  const fetchVisiblePins = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const pad = 0.1;
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
        const parsedBathroomData = (bathroomData as Place[]).map((bathroom) => ({
          id: bathroom.id,
          name: bathroom.name,
          position: bathroom.position,
          details: bathroom.details,
        }));

        setPlaces(parsedBathroomData);
      } else if (res.status === 404) {
        setPlaces([]);
      } else {
        console.error("Error fetching bathrooms:", res.status);
      }
    } catch (error) {
      console.error("Error fetching bathrooms:", error);
    }
  }, []);

  // fetches pins. If user moves before, reset timer
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
          clickableIcons: false,
          disableDoubleClickZoom: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
        }}
      >
        {places.map((p) => (
          <Marker
            key={p.id}
            position={p.position}
            title={p.name}
            icon={pinIcon ?? undefined}
            onClick={() => setSelected(p)}
          />
        ))}
        {addMode && draftPosition && (
          <Marker
            position={draftPosition}
            icon={pinIcon ?? undefined}
          />
        )}
        {selected && (
        <InfoWindow
          position={selected.position}
          onCloseClick={() => setSelected(null)}
          options={{
            pixelOffset: new google.maps.Size(0, -10),
            disableAutoPan: false,
          }}
        >
        <div
          className="infowin"
          style={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          <strong className="infowin-title">{selected.name}</strong>
          {selected.details && <p className="infowin-text">{selected.details}</p>}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "6px" }}>
            <Button
              data-testid="get-directions"
              variant="contained"
              size="small"
              onClick={() =>
                openWalkingDirections(selected.position.lat, selected.position.lng)
              }
              sx={{
                bgcolor: "primary.main",
                color: "common.white",
                fontWeight: 500,
                textTransform: "none",
                borderRadius: "8px",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Get Directions
            </Button>
          </div>
        </div>
        </InfoWindow>
        )}
      </GoogleMap>

      {!addMode && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => {
            setAddMode(true);
            setBannerOpen(true);
            setSelected(null);
            setAddOpen(false);
            setDraftPosition(null);
          }}
          sx={{
              position: "fixed",
              right: 24,
              bottom: 24,
              zIndex: (t) => t.zIndex.modal + 1,
              bgcolor: "primary.main",
              color: "common.white",
              "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <AddBathroomPrompt
        bannerOpen={bannerOpen}
        onCancel={cancelAddFlow}
        showPeekCard={addMode && !addOpen}
        onPeekTouchStart={onPeekTouchStart}
        onPeekTouchEnd={onPeekTouchEnd}
        onPeekMouseDown={onPeekMouseDown}
      />
    
      <AddBathroom
        open={addOpen}
        onOpen={() => {
          setBannerOpen(false);
        }}
        onClose={() => {
          setAddOpen(false);
          setBannerOpen(true);
          setDraftPosition(null);
        }}
        onCancelFull={cancelAddFlow}
        position={draftPosition}
        name={formName}
        details={formDetails}
        onNameChange={setFormName}
        onDetailsChange={setFormDetails}
        resetToken={resetToken}
        onSubmit={async (data) => {
          setPlaces((prev) => [
            ...prev,
            {
              id: Date.now(),
              name: data.name,
              position: data.position,
              details: data.details,
            },
          ]);
          setAddOpen(false);
          setAddMode(false);
          setBannerOpen(false);
          setFormName("");
          setFormDetails("");
          setDraftPosition(null);
          setResetToken((t) => t + 1);
        }}
      />
    </div>
  );
}
