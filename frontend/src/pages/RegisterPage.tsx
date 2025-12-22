import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            setStatus("Заполните все поля");
            return;
        }

        try {
            setLoading(true);
            setStatus(null);

            const res = await api.post("/auth/register", {
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
            });

            const token = res.data.token;
            const userRole = res.data.role;

            localStorage.setItem("authToken", token);
            localStorage.setItem("userRole", userRole);

            setStatus("Регистрация успешна! Перенаправление...");
            setTimeout(() => navigate("/search"), 1500);
        } catch (err: any) {
            console.log("REGISTER ERROR", err.response?.data);
            setStatus(err.response?.data?.error || "Ошибка регистрации");
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
                            <circle cx="50" cy="50" r="45" fill="#28a745" stroke="white" strokeWidth="3"/>
                            <text x="50" y="58" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">OG</text>
                        </svg>
                        <h1>OilGas Booking</h1>
                        <p>Создать аккаунт</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Имя</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ваше имя"
                                disabled={loading}
                                required
                            />
                        </div>

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

                        {status && <div className={`message ${status.includes("Ошибка") ? "error-message" : "success-message"}`}>{status}</div>}

                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? "Регистрация..." : "Зарегистрироваться"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
