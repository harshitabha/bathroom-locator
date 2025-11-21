export const GoogleMap = ({children}: { children: React.ReactNode }) => (
  <div data-testid="google-map">{children}</div>
);

export const Marker = ({
  position,
  onClick,
  title,
}: {
  position: { lat: number; lng: number };
  onClick?: () => void;
  title?: string;
}) => (
  <div
    data-testid="marker"
    data-lat={position.lat}
    data-lng={position.lng}
    data-title={title}
    onClick={onClick}
  />
);

export const useLoadScript = () => ({
  isLoaded: true,
  loadError: null as Error | null,
});

(globalThis as unknown as {
  google: {
    maps: {
      MapTypeId: Record<string, string>;
    };
  };
}).google = {
  maps: {
    MapTypeId: {
      ROADMAP: "ROADMAP",
      SATELLITE: "SATELLITE",
      HYBRID: "HYBRID",
      TERRAIN: "TERRAIN",
    }
  }
};
