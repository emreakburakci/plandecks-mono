import axios from 'axios';

const api = axios.create({
    // Vite kullanıyorsanız import.meta.env, Create React App ise process.env
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',});

// 1. İstek (Request) Interceptor: Her isteğe Token ekler
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Cevap (Response) Interceptor: Hataları yakalar
api.interceptors.response.use(
    (response) => response, // Başarılıysa elleme, devam et
    (error) => {
        // Eğer sunucudan 401 (Unauthorized) hatası geldiyse
        if (error.response && error.response.status === 401) {

            // Sadece Dashboard veya korumalı sayfalardaysak uyar ve at
            // (Login sayfasında yanlış şifre girince de 401 dönebilir, onu karıştırmayalım)
            if (window.location.pathname !== '/login') {
                alert("Oturumunuz zaman aşımına uğradı. Lütfen tekrar giriş yapınız.");

                // Token'ı sil
                localStorage.removeItem('token');

                // Login sayfasına yönlendir
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;