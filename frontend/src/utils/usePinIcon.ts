import {useMemo} from 'react';
import {useTheme} from '@mui/material/styles';

/**
 * Custom pin
 * @param {boolean} isLoaded if google maps is loaded
 * @returns {object} pin
 */
export function usePinIcon(isLoaded: boolean) {
  const theme = useTheme();

  return useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) {
      return null;
    }

    const g = window.google;
    const pinColor = theme.palette.secondary.main;
    const innerColor = theme.palette.common.white;

    return {
      url:
        'data:image/svg+xml;charset=UTF-8,' +
        encodeURIComponent(`
          <svg
            width="30"
            height="45"
            viewBox="0 0 30 45"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 0C7 0 0 7 0 15c0 11.25 15 30 15 30
              s15-18.75 15-30C30 7 23 0 15 0z"
              fill="${pinColor}"
            />
            <circle
              cx="15"
              cy="15"
              r="6"
              fill="${innerColor}"
            />
          </svg>
        `),
      scaledSize: new g.maps.Size(20, 30),
      anchor: new g.maps.Point(10, 30),
    } as google.maps.Icon;
  }, [isLoaded]);
}
