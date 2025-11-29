import {createContext} from 'react';
import {type Bathroom} from '../types';


export interface BathroomContextType {
    bathrooms: Bathroom[] | [],
    setBathrooms: React.Dispatch<React.SetStateAction<Bathroom []>>,
    selected: Bathroom | null,
    setSelected: React.Dispatch<React.SetStateAction<Bathroom | null>>,
};

const BathroomContext =
    createContext<BathroomContextType>({} as BathroomContextType);
export default BathroomContext;
