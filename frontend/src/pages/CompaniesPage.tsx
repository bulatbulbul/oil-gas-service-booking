import { useEffect, useState } from "react";
import api from "../api";

type Company = {
    CompanyID: number;
    Name: string;
};

function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    async function loadCompanies() {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/companies/my");
            const data = Array.isArray(res.data) ? res.data : [];
            setCompanies(data);
        } catch (err: any) {
            console.log("COMPANIES ERROR", err.response?.status, err.response?.data);
            setError("Не удалось загрузить ваши компании");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCompanies();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;

        try {
            setCreating(true);
            await api.post("/companies", { name: newName.trim() });
            setNewName("");
            await loadCompanies();
        } catch (err: any) {
            console.log("CREATE COMPANY ERROR", err.response?.status, err.response?.data);
            alert("Не удалось создать компанию");
        } finally {
            setCreating(false);
        }
    }

    function startEdit(c: Company) {
        setEditingId(c.CompanyID);
        setEditingName(c.Name);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingName("");
    }

    async function saveEdit(companyId: number) {
        if (!editingName.trim()) return;

        try {
            await api.put(`/companies/${companyId}`, { name: editingName.trim() });
            cancelEdit();
            await loadCompanies();
        } catch (err: any) {
            console.log("UPDATE COMPANY ERROR", err.response?.status, err.response?.data);
            alert("Не удалось обновить компанию");
        }
    }

    async function handleDelete(companyId: number) {
        if (!confirm("Удалить компанию?")) return;

        try {
            await api.delete(`/companies/${companyId}`);
            await loadCompanies();
        } catch (err: any) {
            console.log("DELETE COMPANY ERROR", err.response?.status, err.response?.data);
            alert("Не удалось удалить компанию");
        }
    }

    if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;
    if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

    return (
        <div
            style={{
                minHeight: "calc(100vh - 160px)",
                display: "flex",
                justifyContent: "center",
                padding: "32px 16px",
            }}
        >
            <div
                style={{
                    maxWidth: 800,
                    width: "100%",
                    background: "white",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                }}
            >
                <h2
                    style={{
                        fontSize: 22,
                        fontWeight: 600,
                        marginBottom: 20,
                        color: "#111827",
                    }}
                >
                    Мои компании
                </h2>

                <form
                    onSubmit={handleCreate}
                    style={{
                        marginBottom: 20,
                        display: "flex",
                        gap: 8,
                    }}
                >
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Название новой компании"
                        style={{
                            flex: 1,
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: 8,
                            fontSize: 14,
                        }}
                    />
                    <button
                        type="submit"
                        disabled={creating}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: creating ? "#93c5fd" : "#2563eb",
                            color: "white",
                            fontWeight: 500,
                            fontSize: 14,
                            cursor: creating ? "default" : "pointer",
                        }}
                    >
                        {creating ? "Создание..." : "Добавить"}
                    </button>
                </form>

                {companies.length === 0 ? (
                    <div style={{ fontSize: 14, color: "#6b7280" }}>
                        У вас пока нет компаний. Добавьте первую компанию выше.
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        {companies.map((c) => (
                            <div
                                key={c.CompanyID}
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    alignItems: "center",
                                    padding: 10,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 10,
                                    background: "#f9fafb",
                                }}
                            >
                                {editingId === c.CompanyID ? (
                                    <>
                                        <input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: "8px 10px",
                                                border: "1px solid #d1d5db",
                                                borderRadius: 8,
                                                fontSize: 14,
                                            }}
                                        />
                                        <button
                                            onClick={() => saveEdit(c.CompanyID)}
                                            type="button"
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: 8,
                                                border: "none",
                                                background: "#10b981",
                                                color: "white",
                                                fontSize: 13,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Сохранить
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            type="button"
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: 8,
                                                border: "1px solid #d1d5db",
                                                background: "white",
                                                fontSize: 13,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Отмена
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            style={{
                                                flex: 1,
                                                fontSize: 14,
                                                color: "#111827",
                                            }}
                                        >
                                            {c.Name}
                                        </div>
                                        <button
                                            onClick={() => startEdit(c)}
                                            type="button"
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: 8,
                                                border: "1px solid #d1d5db",
                                                background: "white",
                                                fontSize: 13,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.CompanyID)}
                                            type="button"
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: 8,
                                                border: "none",
                                                background: "#ef4444",
                                                color: "white",
                                                fontSize: 13,
                                                cursor: "pointer",
                                            }}
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
        </div>
    );
}

export default CompaniesPage;
