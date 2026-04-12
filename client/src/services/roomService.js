import api from './api';

export const getRoomBookings = async (params) => {
    const res = await api.get('/room-bookings', { params });
    return res.data.data;
};

export const createRoomBooking = async (payload) => {
    const res = await api.post('/room-bookings', payload);
    return res.data.data;
};

export const checkInRoomBooking = async (id) => {
    const res = await api.post(`/room-bookings/${id}/check-in`);
    return res.data.data;
};

export const getMyRoomBookings = async (params) => {
    const res = await api.get('/room-bookings', { params });
    return res.data.data;
};