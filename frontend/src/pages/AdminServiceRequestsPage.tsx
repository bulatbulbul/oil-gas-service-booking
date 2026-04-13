import { useEffect, useState } from "react";
import { getAllServiceRequests, updateServiceRequestStatus, type ServiceRequest } from "../api/serviceRequests";

const pageStyle: React.CSSProperties = { maxWidth: 960, margin: "0 auto", padding: "48px 32px" };

const statusLabel: Record<string, string> = {
    pending: "Новая",
    reviewed: "Рассмотрено",
};

const statusStyle = (status: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 2,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    background: status === "pending" ? "#000" : "#f0f0f0",
    color: status === "pending" ? "#fff" : "#999",
});

function AdminServiceRequestsPage() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");

    async function load() {
        try {
            setLoading(true);
            setError(null);
            setRequests(await getAllServiceRequests());
        } catch {
            setError("Не удалось загрузить заявки");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function markReviewed(id: number) {
        await updateServiceRequestStatus(id, "reviewed");
        setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: "reviewed" } : r));
    }

    async function markPending(id: number) {
        await updateServiceRequestStatus(id, "pending");
        setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: "pending" } : r));
    }

    const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
    const pendingCount = requests.filter(r => r.status === "pending").length;

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return (
        <div style={pageStyle}>
            <span style={{ fontSize: 14, color: "#000" }}>{error}</span>
            <button onClick={load} style={{ marginLeft: 16, fontSize: 13, cursor: "pointer", background: "none", border: "none", textDecoration: "underline", fontFamily: "inherit" }}>
                Повторить
            </button>
        </div>
    );

    return (
        <div style={pageStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", margin: 0 }}>
                    Заявки на услуги
                </h1>
                <button
                    onClick={load}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1px solid #e8e8e8", borderRadius: 2, background: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "#666" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#666"; }}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M10 6A4 4 0 1 1 6 2a4 4 0 0 1 3.5 2M10 2v2.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Обновить
                </button>
            </div>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 32 }}>
                {pendingCount > 0
                    ? <><b style={{ color: "#000" }}>{pendingCount}</b> новых заявок</>
                    : "Новых заявок нет"}
            </p>

            {/* Фильтр по статусу */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                {(["all", "pending", "reviewed"] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        style={{
                            padding: "7px 16px",
                            border: "1px solid",
                            borderColor: filter === s ? "#000" : "#e8e8e8",
                            borderRadius: 2,
                            background: filter === s ? "#000" : "#fff",
                            color: filter === s ? "#fff" : "#666",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            letterSpacing: "0.2px",
                        }}
                    >
                        {s === "all" ? "Все" : statusLabel[s]}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>Заявок нет</p>
            ) : (
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px 120px", gap: 16, padding: "0 0 10px", borderBottom: "1px solid #000" }}>
                        {["Услуга / пользователь", "Дата", "Статус", ""].map(h => (
                            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</span>
                        ))}
                    </div>

                    {filtered.map((req) => (
                        <div
                            key={req.request_id}
                            style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px 120px", gap: 16, alignItems: "start", padding: "16px 0", borderBottom: "1px solid #e8e8e8" }}
                        >
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#000", marginBottom: 3 }}>
                                    {req.service_name}
                                </div>
                                {req.user && (
                                    <div style={{ fontSize: 12, color: "#999" }}>
                                        {req.user.Name}{req.user.Email ? ` · ${req.user.Email}` : ""}
                                    </div>
                                )}
                                {req.comment && (
                                    <div style={{ fontSize: 12, color: "#666", marginTop: 6, padding: "6px 10px", background: "#fafafa", borderRadius: 2, borderLeft: "2px solid #e8e8e8" }}>
                                        {req.comment}
                                    </div>
                                )}
                            </div>

                            <div style={{ fontSize: 12, color: "#999", paddingTop: 2 }}>
                                {new Date(req.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                            </div>

                            <div style={{ paddingTop: 2 }}>
                                <span style={statusStyle(req.status)}>{statusLabel[req.status]}</span>
                            </div>

                            <div style={{ paddingTop: 2 }}>
                                {req.status === "pending" ? (
                                    <button
                                        onClick={() => markReviewed(req.request_id)}
                                        style={{ padding: "5px 12px", border: "1px solid #000", borderRadius: 2, background: "#fff", color: "#000", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
                                    >
                                        Рассмотрено
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => markPending(req.request_id)}
                                        style={{ padding: "5px 12px", border: "1px solid #e8e8e8", borderRadius: 2, background: "#fff", color: "#999", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#999"; }}
                                    >
                                        Вернуть
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminServiceRequestsPage;
