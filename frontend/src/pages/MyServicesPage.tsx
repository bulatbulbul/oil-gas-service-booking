import { useEffect, useState } from "react";
import api from "../api";

type Company = {
    CompanyID: number;
    Name: string;
};

type Service = {
    ServiceID: number;
    Title: string;
};

type CompanyService = {
    CompanyServiceID: number;
    CompanyID: number;
    ServiceID: number;
    Company?: Company;
    Service?: Service;
};

function MyServicesPage() {
    const [items, setItems] = useState<CompanyService[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);

    const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");
    const [newServiceTitle, setNewServiceTitle] = useState("");

    const [editingCompanyServiceId, setEditingCompanyServiceId] =
        useState<number | null>(null);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    async function loadAll() {
        try {
            setLoading(true);
            setError(null);

            const [myRes, compRes] = await Promise.all([
                api.get("/company-services/my"),
                api.get("/companies/my"),
            ]);

            const myData = Array.isArray(myRes.data) ? myRes.data : [];
            const compData = Array.isArray(compRes.data) ? compRes.data : [];

            console.log("MY SERVICES RAW", myData);
            console.log("MY COMPANIES RAW", compData);

            setItems(myData);
            setCompanies(compData);
        } catch (err: any) {
            console.log("MY SERVICES ERROR", err.response?.status, err.response?.data);
            setError("Не удалось загрузить ваши услуги");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (selectedCompanyId === "" || !newServiceTitle.trim()) return;

        try {
            setCreating(true);

            const svcRes = await api.post("/services", {
                title: newServiceTitle.trim(),
            });
            const createdService: Service = svcRes.data;

            await api.post("/company-services", {
                company_id: selectedCompanyId,
                service_id: createdService.ServiceID,
            });

            setNewServiceTitle("");
            setSelectedCompanyId("");
            await loadAll();
        } catch (err: any) {
            console.log("CREATE MY SERVICE ERROR", err.response?.status, err.response?.data);
            alert("Не удалось добавить услугу компании");
        } finally {
            setCreating(false);
        }
    }

    function startEdit(cs: CompanyService) {
        setEditingCompanyServiceId(cs.CompanyServiceID);
        setEditingServiceId(cs.ServiceID);
        setEditingTitle(cs.Service?.Title || "");
    }

    function cancelEdit() {
        setEditingCompanyServiceId(null);
        setEditingServiceId(null);
        setEditingTitle("");
    }

    async function saveEdit() {
        if (editingCompanyServiceId == null || editingServiceId == null) return;
        if (!editingTitle.trim()) return;

        try {
            await api.put(`/services/${editingServiceId}`, {
                title: editingTitle.trim(),
            });
            cancelEdit();
            await loadAll();
        } catch (err: any) {
            console.log("UPDATE SERVICE ERROR", err.response?.status, err.response?.data);
            alert("Не удалось переименовать услугу");
        }
    }

    async function handleDeleteBinding(companyServiceId: number) {
        if (!confirm("Удалить услугу у компании?")) return;

        try {
            await api.delete(`/company-services/${companyServiceId}`);
            await loadAll();
        } catch (err: any) {
            console.log("DELETE COMPANY SERVICE ERROR", err.response?.status, err.response?.data);
            alert("Не удалось удалить услугу компании");
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
                    maxWidth: 900,
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
                        marginBottom: 8,
                        color: "#111827",
                    }}
                >
                    Мои услуги
                </h2>

                <form
                    onSubmit={handleCreate}
                    style={{
                        marginBottom: 20,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                    }}
                >
                    <select
                        value={selectedCompanyId}
                        onChange={(e) =>
                            setSelectedCompanyId(e.target.value ? Number(e.target.value) : "")
                        }
                        style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            fontSize: 14,
                            minWidth: 200,
                        }}
                    >
                        <option value="">Выберите компанию</option>
                        {companies.map((c) => (
                            <option key={c.CompanyID} value={c.CompanyID}>
                                {c.Name}
                            </option>
                        ))}
                    </select>

                    <input
                        value={newServiceTitle}
                        onChange={(e) => setNewServiceTitle(e.target.value)}
                        placeholder="Название услуги"
                        style={{
                            flex: 1,
                            minWidth: 260,
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: 10,
                            fontSize: 14,
                        }}
                    />

                    <button
                        type="submit"
                        disabled={creating}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 10,
                            border: "none",
                            background: creating ? "#93c5fd" : "#2563eb",
                            color: "white",
                            fontWeight: 500,
                            fontSize: 14,
                            cursor: creating ? "default" : "pointer",
                        }}
                    >
                        {creating ? "Добавление..." : "Добавить"}
                    </button>
                </form>

                {items.length === 0 ? (
                    <div style={{ fontSize: 14, color: "#6b7280" }}>
                        У ваших компаний пока нет привязанных услуг.
                    </div>
                ) : (
                    <div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1.2fr 1fr auto auto",
                                gap: 10,
                                fontWeight: 600,
                                marginBottom: 8,
                                fontSize: 14,
                                color: "#4b5563",
                            }}
                        >
                            <div>Компания</div>
                            <div>Услуга</div>
                            <div />
                            <div />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {items.map((cs) => {
                                const title = cs.Service?.Title || `Услуга #${cs.ServiceID}`;
                                const isEditing = editingCompanyServiceId === cs.CompanyServiceID;

                                return (
                                    <div
                                        key={cs.CompanyServiceID}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1.2fr 1fr auto auto",
                                            gap: 10,
                                            alignItems: "center",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 10,
                                            padding: 10,
                                            background: "#f9fafb",
                                        }}
                                    >
                                        <div style={{ fontSize: 14, color: "#111827" }}>
                                            {cs.Company?.Name || "Компания ?"}
                                        </div>

                                        <div>
                                            {isEditing ? (
                                                <input
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    style={{
                                                        width: "100%",
                                                        padding: "6px 8px",
                                                        border: "1px solid #d1d5db",
                                                        borderRadius: 8,
                                                        fontSize: 14,
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: 14, color: "#111827" }}>
                          {title}
                        </span>
                                            )}
                                        </div>

                                        <div>
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={saveEdit}
                                                        type="button"
                                                        style={{
                                                            padding: "6px 10px",
                                                            borderRadius: 8,
                                                            border: "none",
                                                            background: "#10b981",
                                                            color: "white",
                                                            fontSize: 13,
                                                            marginRight: 6,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        Сохранить
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        type="button"
                                                        style={{
                                                            padding: "6px 10px",
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
                                                <button
                                                    onClick={() => startEdit(cs)}
                                                    type="button"
                                                    style={{
                                                        padding: "6px 10px",
                                                        borderRadius: 8,
                                                        border: "1px solid #d1d5db",
                                                        background: "white",
                                                        fontSize: 13,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Редактировать
                                                </button>
                                            )}
                                        </div>

                                        <div>
                                            <button
                                                onClick={() => handleDeleteBinding(cs.CompanyServiceID)}
                                                type="button"
                                                style={{
                                                    padding: "6px 10px",
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
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyServicesPage;
