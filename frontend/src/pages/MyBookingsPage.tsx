import { useMyBookings } from "../hooks/useMyBookings";
import StatusBadge from "../components/StatusBadge";

const pageStyle: React.CSSProperties = { maxWidth: 960, margin: "0 auto", padding: "48px 32px" };
const inputStyle: React.CSSProperties = {
    padding: "9px 14px",
    border: "1px solid #e8e8e8",
    borderRadius: 2,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    color: "#000",
};

function MyBookingsPage() {
    const { bookings, filtered, loading, error, q, setQ, sort, setSort, handleDelete } = useMyBookings();

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return <div style={pageStyle}><span style={{ fontSize: 14 }}>{error}</span></div>;

    return (
        <div style={pageStyle}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 8 }}>
                Мои бронирования
            </h1>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 32 }}>
                Всего: {bookings.length}
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Поиск по ID, статусу, описанию..."
                    style={{ ...inputStyle, flex: 1, minWidth: 240 }}
                />
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as "new" | "old")}
                    style={{ ...inputStyle, minWidth: 160 }}
                >
                    <option value="new">Сначала новые</option>
                    <option value="old">Сначала старые</option>
                </select>
            </div>

            {q && (
                <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>
                    Найдено: {filtered.length} из {bookings.length}
                </p>
            )}

            {filtered.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>
                    {q ? "Ничего не найдено" : "У вас пока нет бронирований"}
                </p>
            ) : (
                <div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "80px 120px 1fr 100px",
                            padding: "0 0 10px 0",
                            borderBottom: "1px solid #000",
                            gap: 16,
                        }}
                    >
                        {["ID", "Статус", "Описание", ""].map((h) => (
                            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    {filtered.map((b) => (
                        <div
                            key={b.BookingID}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "80px 120px 1fr 100px",
                                alignItems: "center",
                                padding: "14px 0",
                                borderBottom: "1px solid #e8e8e8",
                                gap: 16,
                            }}
                        >
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#000" }}>
                                #{b.BookingID}
                            </span>
                            <StatusBadge status={b.Status} />
                            <span style={{ fontSize: 13, color: "#666" }}>
                                {b.Description || "—"}
                            </span>
                            <div style={{ textAlign: "right" }}>
                                <button
                                    onClick={() => handleDelete(b.BookingID)}
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBookingsPage;
