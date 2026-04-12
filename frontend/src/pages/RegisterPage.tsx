import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";

function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loading, status, isError, handleRegister } = useRegister();

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleRegister(name, email, password);
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                background: "#000",
                                borderRadius: 2,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: "0.5px",
                            }}
                        >
                            OG
                        </div>
                        <h1>Регистрация</h1>
                        <p>OilGas Booking</p>
                    </div>

                    <form onSubmit={onSubmit} className="auth-form">
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

                        {status && (
                            <div className={isError ? "error-message" : "success-message"}>
                                {status}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? "Создание аккаунта..." : "Создать аккаунт"}
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
