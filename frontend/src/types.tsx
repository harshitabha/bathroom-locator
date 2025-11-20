export interface Place {
  id: string;
  name: string;
  position: google.maps.LatLngLiteral;
  description?: string;
};
