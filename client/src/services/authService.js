import api from './api';

export const loginUser = async (payload) => {
    const res = await api.post('/auth/login', payload);

    // IMPORTANT: your backend wraps response
    return res.data.data;
};