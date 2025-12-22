import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError("Заполните все поля");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await api.post("/auth/login", { email: email.trim(), password });
            const token = res.data.token;
            const userRole = res.data.role;

            localStorage.setItem("authToken", token);
            localStorage.setItem("userRole", userRole);

            navigate("/search");
        } catch (err: any) {
            console.log("LOGIN ERROR", err.response?.data);
            setError(err.response?.data?.error || "Ошибка авторизации");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                            <circle cx="50" cy="50" r="45" fill="#007bff" stroke="white" strokeWidth="3"/>
                            <text x="50" y="58" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">OG</text>
                        </svg>
                        <h1>OilGas Booking</h1>
                        <p>Вход в личный кабинет</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={loading}
                                required
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? "Вход..." : "Войти"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
