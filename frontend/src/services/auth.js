import api from './api';

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getAuthToken = () => {
    return localStorage.getItem('token');
};

export const getUserData = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const updateProfile = async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
};
