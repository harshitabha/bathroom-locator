// Opens Google Maps with walking directions to the specified latitude and longitude
// Opens app if on mobile device
// Otherwise opens maps in new tab
export function openWalkingDirections(lat: number, lng: number) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  window.open(url, '_blank');
}
