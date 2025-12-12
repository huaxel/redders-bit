import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (userId) => {
        try {
            // Fetch fresh user details
            // We need a specific endpoint to get a single user, 
            // but for now we can filter from the list or assume we have the object
            // Let's assume the Login page passes the full user object, or we fetch it.
            // Using existing endpoint logic:
            const res = await fetch('/api/employees');
            const employees = await res.json();
            const foundUser = employees.find(u => u.id === parseInt(userId));

            if (foundUser) {
                setUser(foundUser);
                localStorage.setItem('user', JSON.stringify(foundUser));
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
