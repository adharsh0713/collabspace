import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (organizationId) => {
    if (socket) return socket; // prevent duplicate

    socket = io('http://localhost:5000', {
        query: { organizationId },
    });

    return socket;
};

export const getSocket = () => socket;