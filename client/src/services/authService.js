import api from './api';

export const loginUser = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    return data;
};