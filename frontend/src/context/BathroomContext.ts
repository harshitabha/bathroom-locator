import {createContext} from 'react';
import {type Bathroom} from '../types';


interface BathroomContextType {
    bathrooms: Bathroom[] | [],
    setBathrooms: React.Dispatch<React.SetStateAction<Bathroom []>>,
    selected: Bathroom | null,
    setSelected: React.Dispatch<React.SetStateAction<Bathroom | null>>,
};

const BathroomContext =
    createContext<BathroomContextType | null>(null);
export default BathroomContext;
