import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api";

function LoginPage() {
    const [email, setEmail] = useState("admin@oilgas.ru");
    const [password, setPassword] = useState("admin");
    const [status, setStatus] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setStatus(null);
        try {
            const res = await api.post("/auth/login", { email, password });
            const token = res.data.token as string;
            setAuthToken(token);
            setStatus("Успешный вход");
            navigate("/companies");
        } catch (err: any) {
            console.log("LOGIN ERROR", err.response?.status, err.response?.data);
            setStatus("Ошибка авторизации");
            setAuthToken(null);
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "40px auto" }}>
            <h1>Вход в систему</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginTop: 8 }}>
                    <label>Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" style={{ marginTop: 12 }}>
                    Войти
                </button>
            </form>
            {status && <p>{status}</p>}
        </div>
    );
}

export default LoginPage;
