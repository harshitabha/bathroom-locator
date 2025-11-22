import type {Bathroom} from '../types';

export const basicBathroom: Bathroom = {
  id: crypto.randomUUID(),
  name: 'Namaste Lounge Bathroom',
  position: {
    'lat': 37.00076576303953,
    'lng': -122.05719563060227,
  },
  description: 'more details',
  likes: 0,
};
