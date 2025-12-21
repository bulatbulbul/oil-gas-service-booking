import axios from "axios";

const API_BASE_URL = "http://localhost:8082"; // твой Go-сервер

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Хранение и подстановка Basic-токена
export function setAuthToken(token: string | null) {
    if (token) {
        localStorage.setItem("authToken", token);
    } else {
        localStorage.removeItem("authToken");
    }
}

// Добавляем Authorization перед каждым запросом
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Basic ${token}`;
    }
    return config;
});
