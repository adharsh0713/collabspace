import api from './api';

export const getSeats = async (params) => {
    const res = await api.get('/seats', { params });
    return res.data.data;
};

export const getMySeatBookings = async (params) => {
    const res = await api.get('/seat-bookings/my', { params });
    return res.data.data;
};

export const getAvailableSeats = async (params) => {
    const res = await api.get('/seat-bookings/available', { params });
    return res.data.data;
};

export const createSeatBooking = async (payload) => {
    const res = await api.post('/seat-bookings', payload);
    return res.data.data;
};

export const checkInSeatBooking = async (id) => {
    const res = await api.post(`/seat-bookings/${id}/check-in`);
    return res.data.data;
};
