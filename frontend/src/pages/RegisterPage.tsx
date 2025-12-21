import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setStatus(null);

        try {
            setLoading(true);
            await api.post("/auth/register", {
                name,
                email,
                password,
                role,
            });
            setStatus("Регистрация успешна. Теперь можно войти.");
            // опционально сразу перейти на /login
            navigate("/login");
        } catch (err: any) {
            console.log("REGISTER ERROR", err.response?.status, err.response?.data);
            setStatus(err.response?.data || "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "40px auto" }}>
            <h1>Регистрация</h1>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Имя</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginTop: 8 }}>
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

                <div style={{ marginTop: 8 }}>
                    <label>Роль</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                    </select>
                </div>

                <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
                    Зарегистрироваться
                </button>
            </form>

            {status && <p style={{ marginTop: 10 }}>{status}</p>}
        </div>
    );
}

export default RegisterPage;
