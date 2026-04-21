import { useMyBookings } from "../hooks/useMyBookings";
import StatusBadge from "../components/StatusBadge";
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS } from "../types";
import { BASE_URL } from "../api/client";

function formatDate(iso?: string) {
    if (!iso) return null;
    return new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

const pageStyle: React.CSSProperties = { maxWidth: 1040, margin: "0 auto", padding: "48px 32px" };

function MyBookingsPage() {
    const {
        bookings, filtered, loading, error,
        q, setQ, statusFilter, setStatusFilter,
        sort, setSort,
        serviceFilter, setServiceFilter,
        companyFilter, setCompanyFilter,
        services, companies,
        handleDelete,
    } = useMyBookings();

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

            {/* Поиск */}
            <div style={{ position: "relative", marginBottom: 16 }}>
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

            {/* Фильтр по статусу — кнопки */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {(["all", ...BOOKING_STATUSES] as const).map((s) => {
                    const active = statusFilter === s;
                    return (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            style={{
                                padding: "5px 14px",
                                borderRadius: 20,
                                border: active ? "1px solid #000" : "1px solid #e0e0e0",
                                background: active ? "#000" : "#fff",
                                color: active ? "#fff" : "#555",
                                fontSize: 12,
                                fontWeight: active ? 600 : 400,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "all 0.15s",
                            }}
                        >
                            {s === "all" ? "Все" : BOOKING_STATUS_LABELS[s]}
                            {s !== "all" && (
                                <span style={{ marginLeft: 5, opacity: 0.6 }}>
                                    {bookings.filter((b) => b.Status === s).length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Сортировка и фильтры */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                <button
                    onClick={() => setSort(sort === "new" ? "old" : "new")}
                    style={{
                        width: 160, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                        padding: "6px 14px", borderRadius: 20, boxSizing: "border-box",
                        border: "1px solid #000", background: "#000", color: "#fff",
                        fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                    }}
                >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        {sort === "new"
                            ? <path d="M5.5 1v9M2 7l3.5 3.5L9 7" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            : <path d="M5.5 10V1M2 4L5.5.5 9 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        }
                    </svg>
                    {sort === "new" ? "Сначала новые" : "Сначала старые"}
                </button>

                <select
                    value={serviceFilter}
                    onChange={e => setServiceFilter(e.target.value)}
                    style={{
                        width: 160, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontFamily: "inherit",
                        outline: "none", cursor: "pointer", boxSizing: "border-box",
                        border: serviceFilter ? "1px solid #000" : "1px solid #e0e0e0",
                        background: serviceFilter ? "#000" : "#fff",
                        color: serviceFilter ? "#fff" : "#555",
                    }}
                >
                    <option value="">Все услуги</option>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                    value={companyFilter}
                    onChange={e => setCompanyFilter(e.target.value)}
                    style={{
                        width: 160, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontFamily: "inherit",
                        outline: "none", cursor: "pointer", boxSizing: "border-box",
                        border: companyFilter ? "1px solid #000" : "1px solid #e0e0e0",
                        background: companyFilter ? "#000" : "#fff",
                        color: companyFilter ? "#fff" : "#555",
                    }}
                >
                    <option value="">Все компании</option>
                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {(q || statusFilter !== "all" || serviceFilter || companyFilter) && (
                <p style={{ fontSize: 12, color: "#bbb", marginBottom: 20 }}>
                    Найдено: {filtered.length} из {bookings.length}
                </p>
            )}

            {filtered.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>
                    {q || statusFilter !== "all" ? "Ничего не найдено" : "У вас пока нет бронирований"}
                </p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filtered.map((b) => {
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
                                {/* Шапка: статус + дата */}
                                <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f4f4f4" }}>
                                    <StatusBadge status={b.Status} />
                                    {b.CreatedAt && (
                                        <span style={{ fontSize: 12, color: "#bbb" }}>
                                            {formatDate(b.CreatedAt)}
                                        </span>
                                    )}
                                </div>

                                {/* Тело */}
                                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

                                    {/* Компания */}
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

                                    {/* Услуги */}
                                    {(b.BookingServices ?? []).length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Услуги</div>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                {(b.BookingServices ?? []).map(bs => (
                                                    <span
                                                        key={bs.BookingServiceID}
                                                        style={{ padding: "4px 10px", background: "#f7f7f7", borderRadius: 4, fontSize: 12, color: "#333", border: "1px solid #efefef" }}
                                                    >
                                                        {bs.CompanyService?.Service?.Title ?? "—"}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Комментарий */}
                                    {b.Description && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>Комментарий</div>
                                            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: 0 }}>{b.Description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Футер */}
                                {(b.Status === "requested" || b.Status === "approved") && (
                                    <div style={{ padding: "12px 20px", borderTop: "1px solid #f4f4f4" }}>
                                        <button
                                            onClick={() => handleDelete(b.BookingID)}
                                            style={{ padding: "6px 16px", border: "1px solid #e8e8e8", borderRadius: 4, background: "#fff", color: "#999", fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#999"; }}
                                        >
                                            Отменить заявку
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyBookingsPage;
