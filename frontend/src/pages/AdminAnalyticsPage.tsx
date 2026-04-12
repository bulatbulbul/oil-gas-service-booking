import { Link } from "react-router-dom";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";

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

function AdminAnalyticsPage() {
    const { activeUsers, loading, error } = useAdminAnalytics();

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return <div style={pageStyle}><span style={{ fontSize: 14 }}>{error}</span></div>;

    return (
        <div style={pageStyle}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px" }}>
                    Аналитика
                </h1>
                <Link to="/admin" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>
                    ← Назад
                </Link>
            </div>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 36 }}>
                Пользователи с активными бронированиями
            </p>

            {activeUsers.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>Нет активных бронирований</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr>
                            <th style={{ ...thStyle, width: 60 }}>ID</th>
                            <th style={thStyle}>Имя</th>
                            <th style={thStyle}>Email</th>
                            <th style={{ ...thStyle, width: 140 }}>Активных броней</th>
                            <th style={{ ...thStyle, width: 80, textAlign: "right" }} />
                        </tr>
                        </thead>
                        <tbody>
                        {activeUsers.map((u) => (
                            <tr key={u.user_id}>
                                <td style={{ ...tdStyle, color: "#999", fontVariantNumeric: "tabular-nums" }}>{u.user_id}</td>
                                <td style={{ ...tdStyle, fontWeight: 500 }}>{u.name}</td>
                                <td style={{ ...tdStyle, color: "#666" }}>{u.email || "—"}</td>
                                <td style={tdStyle}>
                                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px" }}>
                                        {u.active_bookings}
                                    </span>
                                </td>
                                <td style={{ ...tdStyle, textAlign: "right" }}>
                                    <Link
                                        to={`/admin/users/${u.user_id}/bookings`}
                                        style={{
                                            padding: "5px 12px",
                                            border: "1px solid #e8e8e8",
                                            borderRadius: 2,
                                            fontSize: 12,
                                            color: "#000",
                                            textDecoration: "none",
                                            fontWeight: 500,
                                            display: "inline-block",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = "#000")}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = "#e8e8e8")}
                                    >
                                        Брони →
                                    </Link>
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

export default AdminAnalyticsPage;
