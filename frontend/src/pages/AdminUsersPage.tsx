import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

type User = {
    UserID: number;
    Name: string;
    Email?: string | null;
    Role: string;
};

function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadUsers() {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/users");
            const data = Array.isArray(res.data) ? res.data : [];
            setUsers(data);
        } catch (err: any) {
            console.log("USERS ERROR", err.response?.status, err.response?.data);
            setError("Не удалось загрузить пользователей");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function handleDelete(userId: number) {
        if (!confirm(`Удалить пользователя #${userId}?`)) return;

        try {
            await api.delete(`/users/${userId}`);
            await loadUsers();
        } catch (err: any) {
            console.log("DELETE USER ERROR", err.response?.status, err.response?.data);
            alert("Не удалось удалить пользователя");
        }
    }

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
                        Пользователи
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

                {users.length === 0 ? (
                    <div
                        style={{
                            marginTop: 12,
                            fontSize: 14,
                            color: "#6b7280",
                        }}
                    >
                        Пользователей нет.
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
                                        width: 120,
                                    }}
                                >
                                    Роль
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
                            {users.map((u) => (
                                <tr key={u.UserID}>
                                    <td
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            padding: 8,
                                            color: "#4b5563",
                                        }}
                                    >
                                        {u.UserID}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            padding: 8,
                                            color: "#111827",
                                        }}
                                    >
                                        {u.Name}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            padding: 8,
                                            color: "#4b5563",
                                        }}
                                    >
                                        {u.Email || "—"}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            padding: 8,
                                            color: "#111827",
                                        }}
                                    >
                                        {u.Role}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            padding: 8,
                                            textAlign: "right",
                                        }}
                                    >
                                        <button
                                            onClick={() => handleDelete(u.UserID)}
                                            style={{
                                                padding: "6px 10px",
                                                borderRadius: 8,
                                                border: "none",
                                                background: "#ef4444",
                                                color: "white",
                                                fontSize: 13,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Удалить
                                        </button>
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

export default AdminUsersPage;
