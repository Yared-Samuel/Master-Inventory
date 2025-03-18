import { createContext, useState, useEffect } from "react";

const AuthContext = createContext({
    auth: {},
    setAuth: () => {}
});

export const AuthProvider = ({ children }) => {
    // Initialize auth state from localStorage if available
    const [auth, setAuthState] = useState(() => {
        // Check if we're in the browser environment
        if (typeof window !== 'undefined') {
            const savedAuth = localStorage.getItem('authData');
            try {
                const parsed = savedAuth ? JSON.parse(savedAuth) : {};
                console.log("Loaded auth from storage:", parsed);
                return parsed;
            } catch (e) {
                console.error("Error parsing saved auth data:", e);
                return {};
            }
        }
        return {};
    });

    // Custom setAuth function that persists to localStorage
    const setAuth = (newAuthData) => {
        console.log("Setting auth state to:", newAuthData);
        
        // Update state
        setAuthState(newAuthData);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('authData', JSON.stringify(newAuthData));
        }
    };

    // Debug current auth state when it changes
    useEffect(() => {
        console.log("Auth state updated:", auth);
    }, [auth]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;