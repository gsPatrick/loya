import axios from 'axios';

const api = axios.create({
    baseURL: 'https://n8n-hunterbd-lojasimples.r954jc.easypanel.host/api/v1',
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
