export interface Bathroom {
  id: string;
  name: string;
  position: google.maps.LatLngLiteral;
  description?: string;
  num_stalls: number;
  amenities: {
    soap: boolean;
    mirror: boolean;
    hand_dryer: boolean;
    paper_towel: boolean;
    toilet_paper: boolean;
    menstrual_products: boolean;
  };
  gender: {
    male: boolean;
    female: boolean;
    gender_neutral: boolean;
  };
  likes: number;
};
