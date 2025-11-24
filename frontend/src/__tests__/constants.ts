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

export const bathroomWith5Likes: Bathroom = {
  id: '5f1169fe-4db2-48a2-b059-f05cfe63588b',
  name: 'Namaste Lounge Bathroom',
  position: {
    'lat': 37.00076576303953,
    'lng': -122.05719563060227,
  },
  description: 'more details',
  num_stalls: 1,
  amenities: {
    'soap': true,
    'mirror': true,
    'hand_dryer': false,
    'paper_towel': true,
    'toilet_paper': true,
    'menstrual_products': true,
  },
  gender: {
    'male': false,
    'female': true,
    'gender_neutral': false,
  },
  likes: 5,
};
