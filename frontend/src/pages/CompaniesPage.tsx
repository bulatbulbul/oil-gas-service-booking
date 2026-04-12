import { useState } from "react";
import { useCompanies } from "../hooks/useCompanies";

const pageStyle: React.CSSProperties = { maxWidth: 960, margin: "0 auto", padding: "48px 32px" };
const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #000",
    borderRadius: 2,
    fontSize: 14,
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
    letterSpacing: "0.2px",
    flexShrink: 0,
};
const btnOutline: React.CSSProperties = {
    padding: "6px 14px",
    background: "#fff",
    color: "#000",
    border: "1px solid #e8e8e8",
    borderRadius: 2,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
};

function CompaniesPage() {
    const { companies, loading, error, creating, handleCreate, handleUpdate, handleDelete } = useCompanies();
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    function onSubmitCreate(e: React.FormEvent) {
        e.preventDefault();
        handleCreate(newName).then(() => setNewName(""));
    }

    async function onSaveEdit(id: number) {
        await handleUpdate(id, editingName);
        setEditingId(null);
    }

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return <div style={pageStyle}><span style={{ fontSize: 14 }}>{error}</span></div>;

    return (
        <div style={pageStyle}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 8 }}>
                Мои компании
            </h1>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 36 }}>
                {companies.length} {companies.length === 1 ? "компания" : "компаний"}
            </p>

            <form onSubmit={onSubmitCreate} style={{ display: "flex", gap: 8, marginBottom: 36 }}>
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Название новой компании"
                    style={inputStyle}
                />
                <button type="submit" disabled={creating} style={{ ...btnPrimary, opacity: creating ? 0.5 : 1 }}>
                    {creating ? "Создание..." : "Добавить"}
                </button>
            </form>

            {companies.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>У вас пока нет компаний.</p>
            ) : (
                <div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            padding: "0 0 10px 0",
                            borderBottom: "1px solid #000",
                        }}
                    >
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.6px" }}>Название</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.6px" }}>Действия</span>
                    </div>

                    {companies.map((c) => (
                        <div
                            key={c.CompanyID}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "14px 0",
                                borderBottom: "1px solid #e8e8e8",
                            }}
                        >
                            {editingId === c.CompanyID ? (
                                <>
                                    <input
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                        autoFocus
                                    />
                                    <button onClick={() => onSaveEdit(c.CompanyID)} style={btnPrimary}>
                                        Сохранить
                                    </button>
                                    <button onClick={() => setEditingId(null)} style={btnOutline}>
                                        Отмена
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span style={{ flex: 1, fontSize: 14, color: "#000", fontWeight: 500 }}>
                                        {c.Name}
                                    </span>
                                    <button onClick={() => { setEditingId(c.CompanyID); setEditingName(c.Name); }} style={btnOutline}>
                                        Изменить
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.CompanyID)}
                                        style={{ ...btnOutline, color: "#999", borderColor: "#e8e8e8" }}
                                    >
                                        Удалить
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CompaniesPage;
