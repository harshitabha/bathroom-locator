export interface Bathroom {
  id: string;
  name: string;
  position: google.maps.LatLngLiteral;
  description: string;
  likes: number;
  amenities?: Amenities,
  num_stalls?: number,
  gender?: Gender,
};

export interface Gender {
  male: boolean,
  female: boolean,
  gender_neutral: boolean
};

export type GenderOptions = 'female' | 'male' | 'gender_neutral';

export interface Amenities {
  soap: boolean;
  mirror: boolean;
  hand_dryer: boolean;
  paper_towel: boolean;
  toilet_paper: boolean;
  menstrual_products: boolean;
}

export type AmenitieOptions = 'soap' | 'mirror' | 'hand_dryer' |
  'paper_towel' | 'toilet_paper' | 'menstrual_products';
