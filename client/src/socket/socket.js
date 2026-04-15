import { io } from 'socket.io-client';

let socket;

export const connectSocket = (organizationId) => {
    if (socket) return socket; // prevent duplicate

    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        query: { organizationId },
    });

    return socket;
};

export const getSocket = () => socket;