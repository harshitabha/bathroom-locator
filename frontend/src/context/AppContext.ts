import { createContext } from 'react';

interface AppContextType {
    getCurrentUserId: () => Promise<string | null>
};

const AppContext = createContext<AppContextType | null>(null);
export default AppContext;
