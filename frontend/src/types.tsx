export interface Place {
  id: string;
  name: string;
  position: google.maps.LatLngLiteral;
  description: string;
  num_stalls?: number,
  gender?: Gender,
};

export interface Gender {
  male: boolean,
  female: boolean,
  gender_neutral: boolean
};

export type GenderOptions = 'female' | 'male' | 'gender_neutral';
