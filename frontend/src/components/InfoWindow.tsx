import BathroomDetails from './BathroomDetails/BathroomDetails';
import {useContext} from 'react';
import BathroomContext from '../context/BathroomContext';

const InfoWindow = () => {
  const bathroomContext = useContext(BathroomContext);
  const bathroom = bathroomContext?.selected;
  return (
    <>
      {bathroom && (
        <BathroomDetails/>
      )}
    </>
  );
};

export default InfoWindow;
