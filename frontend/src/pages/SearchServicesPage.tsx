import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";

const BASE_URL = "http://localhost:8082";
const pageStyle: React.CSSProperties = { maxWidth: 1040, margin: "0 auto", padding: "48px 32px" };

function CompanyCard({ name, logoUrl, onBook }: { name: string; logoUrl?: string | null; onBook: () => void }) {
    const initial = name.trim()[0]?.toUpperCase() || "?";
    return (
        <div
            style={{ border: "1px solid #e8e8e8", borderRadius: 6, overflow: "hidden", display: "flex", flexDirection: "column", background: "#fff" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.09)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
        >
            <div style={{ width: "100%", aspectRatio: "1/1", background: "#f4f4f4", overflow: "hidden" }}>
                {logoUrl ? (
                    <img src={`${BASE_URL}${logoUrl}`} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                    <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 48, letterSpacing: 2 }}>
                        {initial}
                    </div>
                )}
            </div>
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#000", letterSpacing: "-0.2px", lineHeight: 1.35 }}>{name}</div>
                <button
                    onClick={onBook}
                    style={{ marginTop: "auto", padding: "10px 0", background: "#000", color: "#fff", border: "none", borderRadius: 3, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.2px" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#222")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#000")}
                >
                    Забронировать
                </button>
            </div>
        </div>
    );
}

function ServiceCard({ title, onClick }: { title: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                border: "1px solid #e8e8e8",
                borderRadius: 6,
                background: "#fff",
                color: "#000",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                gap: 12,
                transition: "border-color 0.15s",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#000";
                e.currentTarget.style.background = "#fafafa";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#e8e8e8";
                e.currentTarget.style.background = "#fff";
            }}
        >
            <span style={{ lineHeight: 1.35 }}>{title}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                <path d="M5 2L10 7L5 12" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}

function SearchServicesPage() {
    const {
        filter, setFilter,
        filteredServices, servicesLoading,
        selectedService, results, resultsLoading,
        error, bookingToast, setBookingToast,
        requestSent, requestSending,
        pendingCompany, setPendingCompany, booking,
        selectService, clearSelection, handleBook,
        submitRequest, resetRequest,
    } = useSearch();

    const [comment, setComment] = useState("");
    const [bookingComment, setBookingComment] = useState("");

    useEffect(() => {
        if (!bookingToast) return;
        const t = setTimeout(() => setBookingToast(null), 5000);
        return () => clearTimeout(t);
    }, [bookingToast]);

    return (
        <div style={pageStyle}>

            {selectedService ? (
                /* ──── Результаты по выбранной услуге ──── */
                <>
                    <button
                        onClick={clearSelection}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "#888", padding: 0, marginBottom: 32 }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#000")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#888")}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Все услуги
                    </button>

                    <div style={{ marginBottom: 32 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
                            Выбранная услуга
                        </div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", margin: 0 }}>
                            {selectedService}
                        </h1>
                    </div>

                    {error && <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>{error}</p>}

                    {resultsLoading ? (
                        <p style={{ fontSize: 14, color: "#999" }}>Загрузка компаний...</p>
                    ) : results.length > 0 ? (
                        <>
                            <p style={{ fontSize: 12, color: "#999", marginBottom: 24 }}>
                                {results.length} {results.length === 1 ? "компания" : "компаний"}
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                                {results.map((company) => (
                                    <CompanyCard
                                        key={company.CompanyServiceID}
                                        name={company.Name}
                                        logoUrl={company.LogoURL}
                                        onBook={() => { setBookingComment(""); setPendingCompany(company); }}
                                    />
                                ))}
                            </div>
                        </>
                    ) : !error ? (
                        <p style={{ fontSize: 14, color: "#999" }}>Нет компаний, предоставляющих эту услугу</p>
                    ) : null}
                </>
            ) : (
                /* ──── Каталог услуг ──── */
                <>
                    {/* Шапка */}
                    <div style={{ marginBottom: 36 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 8 }}>
                            Каталог услуг
                        </h1>
                        <p style={{ fontSize: 13, color: "#666" }}>
                            Выберите услугу — покажем компании, которые её предоставляют
                        </p>
                    </div>

                    {/* Поиск по услугам */}
                    <div style={{ position: "relative", marginBottom: 32 }}>
                        <svg
                            width="15" height="15" viewBox="0 0 15 15" fill="none"
                            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.4 }}
                        >
                            <circle cx="6.5" cy="6.5" r="5" stroke="#000" strokeWidth="1.4" />
                            <path d="M10.5 10.5L13.5 13.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Найти услугу..."
                            disabled={servicesLoading}
                            style={{
                                width: "100%",
                                padding: "11px 14px 11px 40px",
                                border: "1px solid #e0e0e0",
                                borderRadius: 6,
                                fontSize: 14,
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box",
                                color: "#000",
                                background: "#fafafa",
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.background = "#fff"; }}
                            onBlur={e => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fafafa"; }}
                        />
                        {filter && (
                            <button
                                onClick={() => setFilter("")}
                                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18, lineHeight: 1, padding: 2 }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#000")}
                                onMouseLeave={e => (e.currentTarget.style.color = "#aaa")}
                            >×</button>
                        )}
                    </div>

                    {/* Счётчик */}
                    {!servicesLoading && (
                        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>
                            {filter
                                ? `${filteredServices.length} из ${0 + (filteredServices.length + (filter ? 0 : 0))} услуг`
                                : `${filteredServices.length} услуг`}
                        </p>
                    )}

                    {/* Сетка услуг */}
                    {servicesLoading ? (
                        <p style={{ fontSize: 14, color: "#999" }}>Загрузка...</p>
                    ) : filteredServices.length === 0 && filter.trim() ? (
                        /* Блок «не нашли — подайте заявку» */
                        <div style={{ maxWidth: 480 }}>
                            {requestSent ? (
                                <div style={{ padding: "28px 24px", border: "1px solid #e8e8e8", borderRadius: 6, textAlign: "center" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 3, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M4 10L8.5 14.5L16 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#000", marginBottom: 6 }}>Заявка отправлена</div>
                                    <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
                                        Администратор рассмотрит запрос на услугу <b>«{filter}»</b>
                                    </div>
                                    <button
                                        onClick={() => { resetRequest(); setComment(""); }}
                                        style={{ padding: "9px 20px", border: "1px solid #e8e8e8", borderRadius: 3, background: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = "#000")}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = "#e8e8e8")}
                                    >
                                        Вернуться к каталогу
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: "24px", border: "1px solid #e8e8e8", borderRadius: 6 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#000", marginBottom: 6 }}>
                                        Услуга не найдена
                                    </div>
                                    <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
                                        Подайте заявку — администратор добавит услугу <b>«{filter}»</b> в каталог
                                    </div>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="Комментарий (необязательно)"
                                        rows={3}
                                        style={{
                                            width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0",
                                            borderRadius: 3, fontSize: 13, fontFamily: "inherit", resize: "vertical",
                                            outline: "none", boxSizing: "border-box", marginBottom: 12, color: "#000",
                                        }}
                                        onFocus={e => (e.currentTarget.style.borderColor = "#000")}
                                        onBlur={e => (e.currentTarget.style.borderColor = "#e0e0e0")}
                                    />
                                    <button
                                        onClick={() => submitRequest(comment || undefined)}
                                        disabled={requestSending}
                                        style={{
                                            padding: "10px 24px", background: "#000", color: "#fff", border: "none",
                                            borderRadius: 3, fontSize: 13, fontWeight: 600, cursor: requestSending ? "default" : "pointer",
                                            fontFamily: "inherit", opacity: requestSending ? 0.6 : 1,
                                        }}
                                        onMouseEnter={e => { if (!requestSending) e.currentTarget.style.background = "#222"; }}
                                        onMouseLeave={e => (e.currentTarget.style.background = "#000")}
                                    >
                                        {requestSending ? "Отправка..." : "Отправить заявку"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                            {filteredServices.map((svc) => (
                                <ServiceCard key={svc.ServiceID} title={svc.Title} onClick={() => selectService(svc)} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Модалка подтверждения бронирования */}
            {pendingCompany && (
                <div
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setPendingCompany(null)}
                >
                    <div
                        style={{ background: "#fff", borderRadius: 8, padding: "28px 32px", width: 420, boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#000", marginBottom: 4 }}>Забронировать услугу</div>
                        <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
                            {selectedService} · <span style={{ color: "#000", fontWeight: 600 }}>{pendingCompany.Name}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Комментарий <span style={{ color: "#bbb" }}>(необязательно)</span></div>
                        <textarea
                            value={bookingComment}
                            onChange={e => setBookingComment(e.target.value)}
                            placeholder="Опишите детали заявки..."
                            rows={4}
                            autoFocus
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 20, color: "#000" }}
                            onFocus={e => (e.currentTarget.style.borderColor = "#000")}
                            onBlur={e => (e.currentTarget.style.borderColor = "#e0e0e0")}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => handleBook(bookingComment)}
                                disabled={booking}
                                style={{ flex: 1, padding: "10px 0", background: "#000", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: booking ? "default" : "pointer", fontFamily: "inherit", opacity: booking ? 0.6 : 1 }}
                                onMouseEnter={e => { if (!booking) e.currentTarget.style.background = "#222"; }}
                                onMouseLeave={e => (e.currentTarget.style.background = "#000")}
                            >
                                {booking ? "Отправка..." : "Забронировать"}
                            </button>
                            <button
                                onClick={() => setPendingCompany(null)}
                                disabled={booking}
                                style={{ flex: 1, padding: "10px 0", background: "#fff", color: "#000", border: "1px solid #e8e8e8", borderRadius: 4, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = "#000")}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = "#e8e8e8")}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {bookingToast && (
                <div style={{
                    position: "fixed", bottom: 32, right: 32, zIndex: 1000,
                    background: "#fff", border: "1px solid #e8e8e8", borderRadius: 6,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: "20px 24px",
                    minWidth: 300, maxWidth: 380, display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                    <div style={{ width: 36, height: 36, borderRadius: 3, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L6.5 11.5L13 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 4 }}>Бронирование создано</div>
                        <div style={{ fontSize: 13, color: "#666" }}>
                            <span style={{ color: "#000", fontWeight: 600 }}>{bookingToast.companyName}</span>
                        </div>
                        <Link to="/bookings/my" style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "#000", fontWeight: 600, textDecoration: "underline" }}>
                            Посмотреть мои брони →
                        </Link>
                    </div>
                    <div
                        onClick={() => setBookingToast(null)}
                        style={{ cursor: "pointer", color: "#ccc", fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: -2 }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#000")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#ccc")}
                    >×</div>
                </div>
            )}
        </div>
    );
}

export default SearchServicesPage;
