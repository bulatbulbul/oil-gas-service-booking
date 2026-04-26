import { useState } from "react";
import { useMyServices } from "../hooks/useMyServices";

const pageStyle: React.CSSProperties = { maxWidth: 1040, margin: "0 auto", padding: "48px 32px" };

function MyServicesPage() {
    const { items, companies, loading, error, creating, handleCreate, handleUpdateService, handleDelete } = useMyServices();
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");
    const [newServiceTitle, setNewServiceTitle] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    function onSubmitCreate(e: React.FormEvent) {
        e.preventDefault();
        if (selectedCompanyId === "") return;
        handleCreate(selectedCompanyId, newServiceTitle).then(() => {
            setNewServiceTitle("");
            setSelectedCompanyId("");
        });
    }

    async function onSaveEdit() {
        if (editingServiceId == null) return;
        await handleUpdateService(editingServiceId, editingTitle);
        setEditingId(null);
    }

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return <div style={pageStyle}><span style={{ fontSize: 14 }}>{error}</span></div>;

    return (
        <div style={pageStyle}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 8 }}>Мои услуги</h1>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 32 }}>
                {items.length} {items.length === 1 ? "услуга" : "услуг"} у ваших компаний
            </p>

            <form onSubmit={onSubmitCreate} style={{ display: "flex", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
                <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : "")}
                    style={{ padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fafafa", color: "#000", minWidth: 200 }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.background = "#fff"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fafafa"; }}
                >
                    <option value="">Выберите компанию</option>
                    {companies.map((c) => (
                        <option key={c.CompanyID} value={c.CompanyID}>{c.Name}</option>
                    ))}
                </select>
                <input
                    value={newServiceTitle}
                    onChange={(e) => setNewServiceTitle(e.target.value)}
                    placeholder="Название услуги"
                    style={{ flex: 1, minWidth: 200, padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fafafa" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.background = "#fff"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fafafa"; }}
                />
                <button
                    type="submit" disabled={creating}
                    style={{ padding: "10px 22px", background: "#000", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: creating ? "default" : "pointer", fontFamily: "inherit", opacity: creating ? 0.5 : 1, flexShrink: 0 }}
                    onMouseEnter={e => { if (!creating) e.currentTarget.style.background = "#222"; }}
                    onMouseLeave={e => (e.currentTarget.style.background = "#000")}
                >
                    {creating ? "Добавление..." : "+ Добавить"}
                </button>
            </form>

            {items.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>У ваших компаний нет привязанных услуг.</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                    {items.map((cs) => {
                        const title = cs.Service?.Title || "Без названия";
                        const isEditing = editingId === cs.CompanyServiceID;

                        return (
                            <div
                                key={cs.CompanyServiceID}
                                style={{ border: "1px solid #e8e8e8", borderRadius: 6, padding: "20px", display: "flex", flexDirection: "column", gap: 12, background: "#fff" }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)")}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                            >
                                <div style={{ display: "inline-block" }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#666", background: "#f4f4f4", padding: "3px 10px", borderRadius: 3, letterSpacing: "0.3px" }}>
                                        {cs.Company?.Name || "—"}
                                    </span>
                                </div>

                                {isEditing ? (
                                    <input
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        autoFocus
                                        style={{ padding: "8px 10px", border: "1px solid #000", borderRadius: 4, fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" }}
                                    />
                                ) : (
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#000", letterSpacing: "-0.2px", lineHeight: 1.35, flex: 1 }}>
                                        {title}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: 6, borderTop: "1px solid #f0f0f0", paddingTop: 12, marginTop: "auto" }}>
                                    {isEditing ? (
                                        <>
                                            <button onClick={onSaveEdit}
                                                style={{ flex: 1, padding: "7px 0", background: "#000", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                                Сохранить
                                            </button>
                                            <button onClick={() => setEditingId(null)}
                                                style={{ flex: 1, padding: "7px 0", background: "#fff", color: "#000", border: "1px solid #e8e8e8", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                                                Отмена
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setEditingId(cs.CompanyServiceID); setEditingServiceId(cs.ServiceID); setEditingTitle(title); }}
                                                style={{ flex: 1, padding: "7px 0", border: "1px solid #e8e8e8", borderRadius: 4, background: "#fff", color: "#000", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                                                onMouseEnter={e => (e.currentTarget.style.borderColor = "#000")}
                                                onMouseLeave={e => (e.currentTarget.style.borderColor = "#e8e8e8")}
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cs.CompanyServiceID)}
                                                style={{ flex: 1, padding: "7px 0", border: "1px solid #e8e8e8", borderRadius: 4, background: "#fff", color: "#999", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#999"; }}
                                            >
                                                Удалить
                                            </button>
                                        </>
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

export default MyServicesPage;
