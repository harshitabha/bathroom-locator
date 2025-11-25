import {createContext} from 'react';

interface AppContextType {
    userId: string | null;
    setUserId: React.Dispatch<React.SetStateAction<string | null>>;
    getCurrentUserId: () => Promise<string | null>
};

const AppContext = createContext<AppContextType | null>(null);
export default AppContext;
