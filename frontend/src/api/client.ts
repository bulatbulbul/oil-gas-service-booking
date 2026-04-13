import axios from "axios";

const API_BASE_URL = "http://localhost:8082";

export const api = axios.create({
    baseURL: API_BASE_URL,
});

export function setAuthToken(token: string | null) {
    if (token) {
        localStorage.setItem("authToken", token);
    } else {
        localStorage.removeItem("authToken");
    }
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
