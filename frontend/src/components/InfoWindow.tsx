import BathroomDetails from './BathroomDetails/BathroomDetails';
import type {Bathroom} from '../types';

import type {Dispatch, SetStateAction} from 'react';

interface bathroomProps {
  bathroom: Bathroom | null,
  setBathroom: Dispatch<SetStateAction<Bathroom | null>>;
};

const InfoWindow = (props: bathroomProps) => {
  const {
    bathroom,
    setBathroom,
  } = props;
  return (
    <>
      {bathroom && (
        <BathroomDetails
          bathroom={bathroom}
          setBathroom={setBathroom}
        />
      )}
    </>
  );
};

export default InfoWindow;
