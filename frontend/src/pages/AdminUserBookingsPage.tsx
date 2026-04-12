import { useParams, Link } from "react-router-dom";
import { useAdminUserBookings } from "../hooks/useAdminUserBookings";
import StatusBadge from "../components/StatusBadge";

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

function AdminUserBookingsPage() {
    const { id } = useParams<{ id: string }>();
    const userId = Number(id);
    const { bookings, loading, error } = useAdminUserBookings(userId);

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return <div style={pageStyle}><span style={{ fontSize: 14 }}>{error}</span></div>;

    return (
        <div style={pageStyle}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px" }}>
                    Брони пользователя #{userId}
                </h1>
                <Link to="/admin/analytics" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>
                    ← К аналитике
                </Link>
            </div>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 36 }}>{bookings.length} бронирований</p>

            {bookings.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>Нет бронирований</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr>
                            <th style={{ ...thStyle, width: 80 }}>ID</th>
                            <th style={{ ...thStyle, width: 140 }}>Статус</th>
                            <th style={thStyle}>Описание</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookings.map((b) => (
                            <tr key={b.BookingID}>
                                <td style={{ ...tdStyle, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                                    #{b.BookingID}
                                </td>
                                <td style={tdStyle}>
                                    <StatusBadge status={b.Status} />
                                </td>
                                <td style={{ ...tdStyle, color: "#666" }}>
                                    {b.Description || "—"}
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

export default AdminUserBookingsPage;
