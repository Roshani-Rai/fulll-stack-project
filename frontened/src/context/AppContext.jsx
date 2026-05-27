import { createContext } from 'react'
import { doctors } from '../assets/assets'

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const currency = '$';
    const value = {
        doctors , currency
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;