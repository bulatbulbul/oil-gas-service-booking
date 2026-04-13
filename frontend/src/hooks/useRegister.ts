import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export function useRegister() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    async function handleRegister(name: string, email: string, password: string) {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setStatus("Заполните все поля");
            setIsError(true);
            return;
        }
        try {
            setLoading(true);
            setStatus(null);
            const data = await register(name.trim(), email.trim(), password.trim());
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("userRole", data.role);
            setStatus("Регистрация успешна!");
            setIsError(false);
            setTimeout(() => navigate("/search"), 1000);
        } catch (err: any) {
            setStatus(err.response?.data || "Ошибка регистрации");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    }

    return { loading, status, isError, handleRegister };
}
