import api from './api';

export const getAllFunds = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/funds?${params}`);
    return response.data;
};

export const getFundById = async (id) => {
    const response = await api.get(`/funds/${id}`);
    return response.data;
};

export const createFund = async (fundData) => {
    const response = await api.post('/funds', fundData);
    return response.data;
};

export const approveFund = async (id, remarks) => {
    const response = await api.post(`/funds/${id}/approve`, { remarks });
    return response.data;
};

export const updateFundStatus = async (id, status) => {
    const response = await api.patch(`/funds/${id}/status`, { status });
    return response.data;
};

export const addMilestone = async (id, milestoneData) => {
    const response = await api.post(`/funds/${id}/milestones`, milestoneData);
    return response.data;
};

export const getFundStats = async () => {
    const response = await api.get('/funds/stats/overview');
    return response.data;
};
