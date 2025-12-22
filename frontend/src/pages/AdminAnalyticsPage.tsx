import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

type ActiveUser = {
    user_id: number;
    name: string;
    email?: string | null;
    active_bookings: number;
};

function AdminAnalyticsPage() {
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadActiveUsers() {
        try {
            setLoading(true);
            setError(null);

            const res = await api.get("/business/users-with-active-bookings");
            const data = Array.isArray(res.data) ? res.data : [];
            setActiveUsers(data);
        } catch (err: any) {
            console.log("ACTIVE USERS ERROR", err.response?.status, err.response?.data);
            setError("Не удалось загрузить пользователей с активными бронированиями");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadActiveUsers();
    }, []);

    if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;
    if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

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
                    maxWidth: 960,
                    width: "100%",
                    background: "white",
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.1)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: 12,
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 20,
                            fontWeight: 600,
                            color: "#111827",
                        }}
                    >
                        Пользователи с активными бронированиями
                    </h2>
                    <Link
                        to="/admin"
                        style={{
                            fontSize: 13,
                            color: "#2563eb",
                            textDecoration: "none",
                        }}
                    >
                        ← Админ‑панель
                    </Link>
                </div>

                {activeUsers.length === 0 ? (
                    <div
                        style={{
                            marginTop: 12,
                            fontSize: 14,
                            color: "#6b7280",
                        }}
                    >
                        Сейчас нет пользователей с активными бронированиями.
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: 8,
                            overflowX: "auto",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 14,
                            }}
                        >
                            <thead>
                            <tr style={{ background: "#f9fafb" }}>
                                <th
                                    style={{
                                        borderBottom: "1px solid #e5e7eb",
                                        textAlign: "left",
                                        padding: 8,
                                        fontWeight: 500,
                                        color: "#4b5563",
                                        width: 70,
                                    }}
                                >
                                    ID
                                </th>
                                <th
                                    style={{
                                        borderBottom: "1px solid #e5e7eb",
                                        textAlign: "left",
                                        padding: 8,
                                        fontWeight: 500,
                                        color: "#4b5563",
                                    }}
                                >
                                    Имя
                                </th>
                                <th
                                    style={{
                                        borderBottom: "1px solid #e5e7eb",
                                        textAlign: "left",
                                        padding: 8,
                                        fontWeight: 500,
                                        color: "#4b5563",
                                    }}
                                >
                                    Email
                                </th>
                                <th
                                    style={{
                                        borderBottom: "1px solid #e5e7eb",
                                        textAlign: "left",
                                        padding: 8,
                                        fontWeight: 500,
                                        color: "#4b5563",
                                        width: 180,
                                    }}
                                >
                                    Активных бронирований
                                </th>
                                <th
                                    style={{
                                        borderBottom: "1px solid #e5e7eb",
                                        padding: 8,
                                        width: 110,
                                    }}
                                />
                            </tr>
                            </thead>
                            <tbody>
                            {activeUsers.map((u) => (
                                <tr key={u.user_id}>
                                    <td
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            padding: 8,
                                            color: "#4b5563",
                                        }}
                                    >
                                        {u.user_id}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            padding: 8,
                                            color: "#111827",
                                        }}
                                    >
                                        {u.name}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            padding: 8,
                                            color: "#4b5563",
                                        }}
                                    >
                                        {u.email || "—"}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            padding: 8,
                                            color: "#111827",
                                        }}
                                    >
                                        {u.active_bookings}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            padding: 8,
                                            textAlign: "right",
                                        }}
                                    >
                                        <Link
                                            to={`/admin/users/${u.user_id}/bookings`}
                                            style={{
                                                padding: "6px 10px",
                                                borderRadius: 8,
                                                border: "1px solid #d1d5db",
                                                background: "white",
                                                fontSize: 13,
                                                color: "#111827",
                                                textDecoration: "none",
                                            }}
                                        >
                                            Брони
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminAnalyticsPage;
