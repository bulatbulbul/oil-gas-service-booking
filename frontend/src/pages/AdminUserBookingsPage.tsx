import { useParams, Link } from "react-router-dom";
import { useAdminUserBookings } from "../hooks/useAdminUserBookings";
import StatusBadge from "../components/StatusBadge";
import { BASE_URL } from "../api/client";

const pageStyle: React.CSSProperties = { maxWidth: 1040, margin: "0 auto", padding: "48px 32px" };

function formatDate(iso?: string) {
    if (!iso) return null;
    return new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function AdminUserBookingsPage() {
    const { id } = useParams<{ id: string }>();
    const userId = Number(id);
    const { bookings, loading, error } = useAdminUserBookings(userId);

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error)   return <div style={pageStyle}><span style={{ fontSize: 14 }}>{error}</span></div>;

    return (
        <div style={pageStyle}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px" }}>
                    Брони пользователя
                </h1>
                <Link to="/admin/analytics" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>
                    ← К аналитике
                </Link>
            </div>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 36 }}>{bookings.length} бронирований</p>

            {bookings.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>Нет бронирований</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {bookings.map(b => {
                        const companiesMap = new Map<number, { CompanyID: number; Name: string; logo_url?: string | null }>();
                        (b.BookingServices ?? []).forEach(bs => {
                            const c = bs.CompanyService?.Company;
                            if (c) companiesMap.set(c.CompanyID, c);
                        });
                        const companies = [...companiesMap.values()];

                        return (
                            <div
                                key={b.BookingID}
                                style={{ border: "1px solid #e8e8e8", borderRadius: 8, background: "#fff", overflow: "hidden", transition: "box-shadow 0.15s" }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)")}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                            >
                                <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f4f4f4" }}>
                                    <StatusBadge status={b.Status} />
                                    {b.CreatedAt && (
                                        <span style={{ fontSize: 12, color: "#bbb" }}>{formatDate(b.CreatedAt)}</span>
                                    )}
                                </div>

                                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                                    {companies.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                {companies.length === 1 ? "Компания" : "Компании"}
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                {companies.map(c => (
                                                    <div key={c.CompanyID} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: 4, overflow: "hidden", flexShrink: 0, border: "1px solid #e8e8e8" }}>
                                                            {c.logo_url ? (
                                                                <img src={`${BASE_URL}${c.logo_url}`} alt={c.Name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                                            ) : (
                                                                <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                                                                    {c.Name.trim()[0]?.toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{c.Name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(b.BookingServices ?? []).length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Услуги</div>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                {(b.BookingServices ?? []).map(bs => (
                                                    <span key={bs.BookingServiceID} style={{ padding: "4px 10px", background: "#f7f7f7", borderRadius: 4, fontSize: 12, color: "#333", border: "1px solid #efefef" }}>
                                                        {bs.CompanyService?.Service?.Title ?? "—"}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {b.Description && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>Комментарий</div>
                                            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: 0 }}>{b.Description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AdminUserBookingsPage;
