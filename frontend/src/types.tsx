export interface Bathroom {
  id: string;
  name: string;
  position: google.maps.LatLngLiteral;
  description: string;
  likes: number;
  amenities?: {
    soap: boolean;
    mirror: boolean;
    hand_dryer: boolean;
    paper_towel: boolean;
    toilet_paper: boolean;
    menstrual_products: boolean;
  };
  num_stalls?: number,
  gender?: Gender,
};

export interface Gender {
  male: boolean,
  female: boolean,
  gender_neutral: boolean
};

export type GenderOptions = 'female' | 'male' | 'gender_neutral';
