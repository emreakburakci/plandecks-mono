import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sayfa yenilenince token varsa kullanıcı var say (Basit kontrol)
        // Gerçekte /me endpointine istek atıp doğrulamak daha iyidir.
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ username: 'User' }); // Token decode edilip kullanıcı adı alınabilir
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await api.post('/auth/authenticate', { username, password });
            localStorage.setItem('token', res.data.token);
            setUser({ username });
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);