import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

type Me = {
    id: number;
    name: string;
    email: string | null;
    role: string;
};

function ProfilePage() {
    const navigate = useNavigate();

    const [me, setMe] = useState<Me | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function handleLogout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        navigate("/login");
    }

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get("/auth/me");
                setMe(res.data);
            } catch (err: any) {
                setError("Не удалось загрузить профиль");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;
    if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

    const initials =
        me?.name
            ?.split(" ")
            .map((p) => p[0])
            .join("")
            .toUpperCase() || "U";

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                padding: "32px 16px",
            }}
        >
            <div
                style={{
                    maxWidth: 520,
                    width: "100%",
                    background: "white",
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: 20,
                    }}
                >
                    Личный кабинет
                </h2>

                <div
                    style={{
                        display: "flex",
                        gap: 16,
                        alignItems: "center",
                        marginBottom: 20,
                    }}
                >
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: "999px",
                            background: "#2563eb",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: 24,
                        }}
                    >
                        {initials}
                    </div>

                    <div>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#111827",
                            }}
                        >
                            {me?.name || "Без имени"}
                        </div>
                        <div
                            style={{
                                marginTop: 4,
                                fontSize: 14,
                                color: "#6b7280",
                            }}
                        >
                            {me?.email || "Email не указан"}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        padding: 16,
                        borderRadius: 12,
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        marginBottom: 20,
                    }}
                >
                    <div
                        style={{
                            fontSize: 14,
                            color: "#6b7280",
                            marginBottom: 10,
                        }}
                    >
                        Быстрый переход:
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 10,
                        }}
                    >
                        <Link
                            to="/bookings/my"
                            style={{
                                padding: "8px 14px",
                                borderRadius: 999,
                                background: "#e0f2fe",
                                color: "#075985",
                                textDecoration: "none",
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                        >
                            Мои бронирования
                        </Link>
                        <Link
                            to="/companies"
                            style={{
                                padding: "8px 14px",
                                borderRadius: 999,
                                background: "#eef2ff",
                                color: "#3730a3",
                                textDecoration: "none",
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                        >
                            Мои компании
                        </Link>
                        <Link
                            to="/my-services"
                            style={{
                                padding: "8px 14px",
                                borderRadius: 999,
                                background: "#ecfdf3",
                                color: "#166534",
                                textDecoration: "none",
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                        >
                            Мои услуги
                        </Link>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: "#ef4444",
                            color: "white",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        Выйти из аккаунта
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
