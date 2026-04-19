import { Link } from "react-router-dom";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";
import type { BookingByDate } from "../hooks/useAdminAnalytics";

const pageStyle: React.CSSProperties = { maxWidth: 1040, margin: "0 auto", padding: "48px 32px" };

// ── Вспомогательные компоненты ───────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
    return (
        <div style={{ border: "1px solid #e8e8e8", borderRadius: 6, padding: "20px 24px", background: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", color: "#000" }}>{value}</div>
            {sub && <div style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>{sub}</div>}
        </div>
    );
}

/** Горизонтальный бар-чарт для популярных услуг */
function ServiceBar({ title, count, maxCount }: { title: string; count: number; maxCount: number }) {
    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 48px", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #f4f4f4" }}>
            <div style={{ fontSize: 13, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
            <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "#000", borderRadius: 4, transition: "width 0.4s" }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#000", textAlign: "right" }}>{count}</div>
        </div>
    );
}

/** Вертикальный бар-чарт для динамики по дням */
function DateChart({ data }: { data: BookingByDate[] }) {
    if (data.length === 0) {
        return <p style={{ fontSize: 13, color: "#bbb" }}>Нет данных за период</p>;
    }
    const maxCount = Math.max(...data.map(d => d.count), 1);
    const chartHeight = 140;

    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: chartHeight + 32, overflowX: "auto", paddingBottom: 4 }}>
            {data.map(d => {
                const barH = Math.max((d.count / maxCount) * chartHeight, d.count > 0 ? 4 : 0);
                const label = d.date.slice(5); // MM-DD
                return (
                    <div key={d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0, width: 28 }}>
                        {d.count > 0 && (
                            <div style={{ fontSize: 10, color: "#666", fontWeight: 600 }}>{d.count}</div>
                        )}
                        <div
                            title={`${d.date}: ${d.count}`}
                            style={{ width: 18, height: barH || 2, background: d.count > 0 ? "#000" : "#eee", borderRadius: "2px 2px 0 0", transition: "height 0.3s" }}
                        />
                        <div style={{ fontSize: 10, color: "#bbb", writingMode: "vertical-rl", transform: "rotate(180deg)", height: 32 }}>{label}</div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Главная страница ─────────────────────────────────────────────────────────

function AdminAnalyticsPage() {
    const { activeUsers, summary, popularServices, popularCompanies, bookingsByDate, loading, error } = useAdminAnalytics();

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error)   return <div style={pageStyle}><span style={{ fontSize: 14 }}>{error}</span></div>;

    const maxBookings = popularServices.length > 0 ? popularServices[0].booking_count : 1;
    const maxCompanyBookings = popularCompanies.length > 0 ? popularCompanies[0].booking_count : 1;

    // Заполняем пропуски в датах нулями
    const filledDates: BookingByDate[] = [];
    if (bookingsByDate.length > 0) {
        const dateMap = new Map(bookingsByDate.map(d => [d.date, d.count]));
        const first = new Date(bookingsByDate[0].date);
        const last  = new Date(bookingsByDate[bookingsByDate.length - 1].date);
        const cur = new Date(first);
        while (cur <= last) {
            const key = cur.toISOString().slice(0, 10);
            filledDates.push({ date: key, count: dateMap.get(key) ?? 0 });
            cur.setDate(cur.getDate() + 1);
        }
    }

    const thStyle: React.CSSProperties = {
        fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase",
        letterSpacing: "0.6px", textAlign: "left", padding: "0 0 10px 0", borderBottom: "1px solid #000",
    };
    const tdStyle: React.CSSProperties = {
        fontSize: 13, color: "#000", padding: "14px 0",
        borderBottom: "1px solid #e8e8e8", verticalAlign: "middle",
    };

    return (
        <div style={pageStyle}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 36 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px" }}>Аналитика</h1>
                <Link to="/admin" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>← Назад</Link>
            </div>

            {/* ── Сводные карты ───────────────────────────────────────────── */}
            {summary && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 48 }}>
                    <StatCard label="Всего бронирований" value={summary.total_bookings} />
                    <StatCard label="Активных"           value={summary.active_bookings} sub="запрос + подтверждено" />
                    <StatCard label="Компаний"           value={summary.total_companies} />
                    <StatCard label="Услуг"              value={summary.available_services} sub="с привязанной компанией" />
                </div>
            )}

            <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 4 }}>
                    Популярные услуги
                </div>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>По количеству бронирований</div>
                {popularServices.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#bbb" }}>Нет данных</p>
                ) : (
                    <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 48px", gap: 12, paddingBottom: 8, marginBottom: 4 }}>
                            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px" }}>Услуга</div>
                            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px" }}></div>
                            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Броней</div>
                        </div>
                        {popularServices.map(s => (
                            <ServiceBar key={s.service_id} title={s.title} count={s.booking_count} maxCount={maxBookings} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Популярные компании ─────────────────────────────────────── */}
            <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 4 }}>
                    Популярные компании
                </div>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>По количеству бронирований</div>
                {popularCompanies.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#bbb" }}>Нет данных</p>
                ) : (
                    <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 48px", gap: 12, paddingBottom: 8, marginBottom: 4 }}>
                            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px" }}>Компания</div>
                            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px" }}></div>
                            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Броней</div>
                        </div>
                        {popularCompanies.map(c => (
                            <ServiceBar key={c.company_id} title={c.name} count={c.booking_count} maxCount={maxCompanyBookings} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Активные пользователи ───────────────────────────────────── */}
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 16 }}>
                Пользователи с активными бронированиями
            </div>
            {activeUsers.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>Нет активных бронирований</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Имя</th>
                                <th style={thStyle}>Email</th>
                                <th style={{ ...thStyle, width: 140 }}>Активных броней</th>
                                <th style={{ ...thStyle, width: 80, textAlign: "right" }} />
                            </tr>
                        </thead>
                        <tbody>
                            {activeUsers.map((u) => (
                                <tr key={u.user_id}>
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
                                            style={{ padding: "5px 12px", border: "1px solid #e8e8e8", borderRadius: 2, fontSize: 12, color: "#000", textDecoration: "none", fontWeight: 500, display: "inline-block" }}
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
