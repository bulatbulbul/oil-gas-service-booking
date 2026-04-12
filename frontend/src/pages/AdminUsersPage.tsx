import { Link } from "react-router-dom";
import { useAdminUsers } from "../hooks/useAdminUsers";

const pageStyle: React.CSSProperties = { maxWidth: 960, margin: "0 auto", padding: "48px 32px" };
const thStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    textAlign: "left",
    padding: "0 0 10px 0",
    borderBottom: "1px solid #000",
};
const tdStyle: React.CSSProperties = {
    fontSize: 13,
    color: "#000",
    padding: "14px 0",
    borderBottom: "1px solid #e8e8e8",
    verticalAlign: "middle",
};

function AdminUsersPage() {
    const { users, loading, error, handleDelete } = useAdminUsers();

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return <div style={pageStyle}><span style={{ fontSize: 14 }}>{error}</span></div>;

    return (
        <div style={pageStyle}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px" }}>
                    Пользователи
                </h1>
                <Link to="/admin" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>
                    ← Назад
                </Link>
            </div>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 36 }}>{users.length} аккаунтов</p>

            {users.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>Нет пользователей</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr>
                            <th style={{ ...thStyle, width: 60 }}>ID</th>
                            <th style={thStyle}>Имя</th>
                            <th style={thStyle}>Email</th>
                            <th style={{ ...thStyle, width: 100 }}>Роль</th>
                            <th style={{ ...thStyle, width: 80, textAlign: "right" }} />
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u) => (
                            <tr key={u.UserID}>
                                <td style={{ ...tdStyle, color: "#999", fontVariantNumeric: "tabular-nums" }}>{u.UserID}</td>
                                <td style={{ ...tdStyle, fontWeight: 500 }}>{u.Name}</td>
                                <td style={{ ...tdStyle, color: "#666" }}>{u.Email || "—"}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        color: u.Role === "admin" ? "#000" : "#666",
                                    }}>
                                        {u.Role}
                                    </span>
                                </td>
                                <td style={{ ...tdStyle, textAlign: "right" }}>
                                    <button
                                        onClick={() => handleDelete(u.UserID)}
                                        style={{
                                            padding: "5px 12px",
                                            border: "1px solid #e8e8e8",
                                            borderRadius: 2,
                                            background: "#fff",
                                            color: "#999",
                                            fontSize: 12,
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#999"; }}
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
    );
}

export default AdminUsersPage;
