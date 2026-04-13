import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useUser } from "../context/UserContext";

export function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { refresh } = useUser();

    async function handleLogin(email: string, password: string) {
        if (!email.trim() || !password.trim()) {
            setError("Заполните все поля");
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const data = await login(email.trim(), password);
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("userRole", data.role);
            refresh();
            navigate("/search");
        } catch {
            setError("Неверный email или пароль");
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, handleLogin };
}
