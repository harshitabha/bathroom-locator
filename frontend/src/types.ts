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
  'male': boolean,
  'female': boolean,
  'gender_neutral': boolean
};

export interface Amenities {
  soap: boolean;
  mirror: boolean;
  hand_dryer: boolean;
  paper_towel: boolean;
  toilet_paper: boolean;
  menstrual_products: boolean;
}

export type OptionalObj<T> = {
  [K in keyof T]?: T[K]
};

export type AmenityOptions = keyof Amenities;
