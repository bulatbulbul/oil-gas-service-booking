import { Link } from "react-router-dom";

function AdminPage() {
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
                    maxWidth: 420,
                    width: "100%",
                    background: "white",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: 12,
                    }}
                >
                    Админ‑панель
                </h2>

                <p
                    style={{
                        margin: 0,
                        marginBottom: 16,
                        fontSize: 14,
                        color: "#6b7280",
                    }}
                >
                    Разделы управления.
                </p>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    <Link
                        to="/admin/users"
                        style={{
                            padding: "9px 12px",
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            textDecoration: "none",
                            fontSize: 14,
                            color: "#111827",
                        }}
                    >
                        Пользователи
                    </Link>

                    <Link
                        to="/admin/analytics"
                        style={{
                            padding: "9px 12px",
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            textDecoration: "none",
                            fontSize: 14,
                            color: "#111827",
                        }}
                    >
                        Аналитика
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;
