// lib/api.js

import axios from 'axios';

// 1. Cria uma instância do Axios com a URL base da sua API
const api = axios.create({
  baseURL: 'https://doculinka-api.inn2fb.easypanel.host/api',
});


// 2. Interceptor de Requisição (Request Interceptor)
// Esta função é executada ANTES de cada requisição ser enviada.
api.interceptors.request.use(
  (config) => {
    // Pega o token de acesso do localStorage
    const token = localStorage.getItem('authToken');
    
    // Se o token existir, adiciona o cabeçalho de autorização
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Retorna a configuração modificada para que a requisição prossiga
    return config;
  },
  (error) => {
    // Se houver um erro na configuração da requisição, rejeita a promise
    return Promise.reject(error);
  }
);


// 3. Interceptor de Resposta (Response Interceptor)
// Esta função é executada QUANDO uma resposta da API é recebida.
// É aqui que a "mágica" do refresh token acontece.
api.interceptors.response.use(
  // Se a resposta for bem-sucedida (status 2xx), apenas a retorna
  (response) => {
    return response;
  },
  // Se a resposta for um erro...
  async (error) => {
    const originalRequest = error.config;

    // Verifica se o erro é 401 (Não Autorizado) e se AINDA não tentamos renovar o token para esta requisição
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marca que já tentamos renovar

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            // Se não houver refresh token, desloga o usuário
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Faz a chamada para o endpoint de refresh
        const { data } = await api.post('/auth/refresh', { refreshToken });

        // Salva os novos tokens no localStorage
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Atualiza o cabeçalho de autorização na requisição original que falhou
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

        // Reenvia a requisição original com o novo token
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh token também falhar (expirado/inválido), limpa tudo e desloga
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Para qualquer outro erro, apenas o rejeita
    return Promise.reject(error);
  }
);

export default api;
