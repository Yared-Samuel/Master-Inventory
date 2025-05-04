"use client";
import { createContext, useState, useEffect } from "react";

const AuthContext = createContext({
    auth: {},
    setAuth: () => {}
});

export const AuthProvider = ({ children }) => {
    const [auth, setAuthState] = useState({});

    useEffect(() => {
        const loadAuthData = () => {
            try {
                if (typeof window !== 'undefined') {
                    const savedAuth = localStorage.getItem('authData');
                    if (savedAuth && savedAuth !== 'undefined' && savedAuth !== 'null') {
                        try {
                            const parsed = JSON.parse(savedAuth);
                            if (parsed && typeof parsed === 'object') {
                                setAuthState(parsed);
                            }
                        } catch (parseError) {
                            console.error("Error parsing auth data:", parseError);
                            localStorage.removeItem('authData');
                        }
                    }
                }
            } catch (e) {
                console.error("Error accessing localStorage:", e);
            }
        };

        loadAuthData();
    }, []);

    const setAuth = (newAuthData) => {
        try {
            setAuthState(newAuthData);
            if (typeof window !== 'undefined' && newAuthData) {
                localStorage.setItem('authData', JSON.stringify(newAuthData));
            }
        } catch (e) {
            console.error("Error saving auth data:", e);
        }
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;