import { createContext, useContext, useState, useEffect } from 'react';
import { connectSocket, getSocket } from '../socket/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser && storedUser !== 'undefined') {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch {
                localStorage.clear();
            }
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        if (!user?.organizationId) return;

        const socket = connectSocket(user.organizationId);

        socket.on('connect', () => {
            console.log('Connected:', socket.id);
        });

        return () => {
            socket.disconnect();
        };
    }, [user?.organizationId]);

    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        const socket = getSocket();
        socket?.disconnect();

        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);