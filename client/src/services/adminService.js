import api from './api';

export const createSeat = async (payload) => {
    const res = await api.post('/admin/seats', payload);
    return res.data.data;
};

export const createRoom = async (payload) => {
    const res = await api.post('/admin/rooms', payload);
    return res.data.data;
};