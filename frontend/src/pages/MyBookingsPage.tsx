import { useMyBookings } from "../hooks/useMyBookings";
import StatusBadge from "../components/StatusBadge";

const pageStyle: React.CSSProperties = { maxWidth: 1040, margin: "0 auto", padding: "48px 32px" };

function MyBookingsPage() {
    const { bookings, filtered, loading, error, q, setQ, sort, setSort, handleDelete } = useMyBookings();

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return <div style={pageStyle}><span style={{ fontSize: 14 }}>{error}</span></div>;

    return (
        <div style={pageStyle}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 8 }}>
                Мои бронирования
            </h1>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 28 }}>
                {bookings.length} {bookings.length === 1 ? "бронирование" : "бронирований"}
            </p>

            {/* Фильтры */}
            <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.35, pointerEvents: "none" }}>
                        <circle cx="6" cy="6" r="4.5" stroke="#000" strokeWidth="1.3" />
                        <path d="M9.5 9.5L12 12" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Поиск по описанию..."
                        style={{ width: "100%", padding: "10px 12px 10px 34px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fafafa", color: "#000" }}
                        onFocus={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.background = "#fff"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fafafa"; }}
                    />
                </div>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as "new" | "old")}
                    style={{ padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fafafa", color: "#000", minWidth: 160 }}
                >
                    <option value="new">Сначала новые</option>
                    <option value="old">Сначала старые</option>
                </select>
            </div>

            {q && (
                <p style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>
                    Найдено: {filtered.length} из {bookings.length}
                </p>
            )}

            {filtered.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>
                    {q ? "Ничего не найдено" : "У вас пока нет бронирований"}
                </p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {filtered.map((b) => (
                        <div
                            key={b.BookingID}
                            style={{ border: "1px solid #e8e8e8", borderRadius: 6, padding: "20px", display: "flex", flexDirection: "column", gap: 12, background: "#fff" }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)")}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                        >
                            <div>
                                <StatusBadge status={b.Status} />
                            </div>
                            <p style={{ fontSize: 13, color: "#444", lineHeight: 1.5, margin: 0, flex: 1 }}>
                                {b.Description || <span style={{ color: "#bbb" }}>Без описания</span>}
                            </p>
                            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
                                <button
                                    onClick={() => handleDelete(b.BookingID)}
                                    style={{ padding: "6px 14px", border: "1px solid #e8e8e8", borderRadius: 4, background: "#fff", color: "#999", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#999"; }}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBookingsPage;
