import { useState } from "react";
import { useMyServices } from "../hooks/useMyServices";

const pageStyle: React.CSSProperties = { maxWidth: 960, margin: "0 auto", padding: "48px 32px" };
const inputStyle: React.CSSProperties = {
    padding: "10px 14px",
    border: "1px solid #e8e8e8",
    borderRadius: 2,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
};
const btnPrimary: React.CSSProperties = {
    padding: "10px 20px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 2,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
};
const btnOutline: React.CSSProperties = {
    padding: "5px 12px",
    background: "#fff",
    color: "#000",
    border: "1px solid #e8e8e8",
    borderRadius: 2,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
};

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
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 8 }}>
                Мои услуги
            </h1>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 36 }}>
                {items.length} {items.length === 1 ? "услуга" : "услуг"} у ваших компаний
            </p>

            <form onSubmit={onSubmitCreate} style={{ display: "flex", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
                <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : "")}
                    style={{ ...inputStyle, minWidth: 200 }}
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
                    style={{ ...inputStyle, flex: 1, minWidth: 200 }}
                />
                <button type="submit" disabled={creating} style={{ ...btnPrimary, opacity: creating ? 0.5 : 1 }}>
                    {creating ? "Добавление..." : "Добавить"}
                </button>
            </form>

            {items.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>У ваших компаний нет привязанных услуг.</p>
            ) : (
                <div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr auto",
                            gap: 16,
                            padding: "0 0 10px 0",
                            borderBottom: "1px solid #000",
                        }}
                    >
                        {["Компания", "Услуга", ""].map((h) => (
                            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    {items.map((cs) => {
                        const title = cs.Service?.Title || `Услуга #${cs.ServiceID}`;
                        const isEditing = editingId === cs.CompanyServiceID;
                        return (
                            <div
                                key={cs.CompanyServiceID}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr auto",
                                    gap: 16,
                                    alignItems: "center",
                                    padding: "14px 0",
                                    borderBottom: "1px solid #e8e8e8",
                                }}
                            >
                                <span style={{ fontSize: 13, color: "#000", fontWeight: 500 }}>
                                    {cs.Company?.Name || "—"}
                                </span>
                                <div>
                                    {isEditing ? (
                                        <input
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            style={{ ...inputStyle, width: "100%", border: "1px solid #000" }}
                                            autoFocus
                                        />
                                    ) : (
                                        <span style={{ fontSize: 13, color: "#666" }}>{title}</span>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    {isEditing ? (
                                        <>
                                            <button onClick={onSaveEdit} style={{ ...btnPrimary, padding: "5px 14px" }}>
                                                Сохранить
                                            </button>
                                            <button onClick={() => setEditingId(null)} style={btnOutline}>
                                                Отмена
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setEditingId(cs.CompanyServiceID); setEditingServiceId(cs.ServiceID); setEditingTitle(title); }}
                                                style={btnOutline}
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cs.CompanyServiceID)}
                                                style={{ ...btnOutline, color: "#999" }}
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
