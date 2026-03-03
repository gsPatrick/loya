import axios from 'axios';

export const API_URL = 'https://geral-tiptagapi.r954jc.easypanel.host/api/v1';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para adicionar Token (se houver auth no futuro)
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
