// opens Google Maps with walking directions to the specified latitude and longitude
// automatically opens the app if on mobile or new tab with maps on desktop or if app not installed
export function openWalkingDirections(lat: number, lng: number) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  window.open(url, '_blank');
}
