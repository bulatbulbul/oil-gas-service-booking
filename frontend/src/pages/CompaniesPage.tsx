import { useState } from "react";
import { useCompanies } from "../hooks/useCompanies";
import { useMyServices } from "../hooks/useMyServices";
import type { Company } from "../types";

const BASE_URL = "http://localhost:8082";
const pageStyle: React.CSSProperties = { maxWidth: 1040, margin: "0 auto", padding: "48px 32px" };

// ── Карточка компании ────────────────────────────────────────────────────────

function CompanyCard({
    company,
    logoUploading,
    logoVersion,
    onSelect,
    onEdit,
    onDelete,
    onUploadLogo,
}: {
    company: Company;
    logoUploading: number | null;
    logoVersion?: number;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onUploadLogo: () => void;
}) {
    const initial = company.Name.trim()[0]?.toUpperCase() || "?";
    const isUploading = logoUploading === company.CompanyID;

    return (
        <div
            style={{ border: "1px solid #e8e8e8", borderRadius: 6, overflow: "hidden", display: "flex", flexDirection: "column", background: "#fff", cursor: "default" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
        >
            {/* Логотип (просто картинка, не кликабельная) */}
            <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", flexShrink: 0 }}>
                {isUploading ? (
                    <div style={{ width: "100%", height: "100%", background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#999" }}>
                        Загрузка...
                    </div>
                ) : company.logo_url ? (
                    <img src={`${BASE_URL}${company.logo_url}${logoVersion ? `?v=${logoVersion}` : ""}`} alt={company.Name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                    <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 40, letterSpacing: 1 }}>
                        {initial}
                    </div>
                )}
            </div>

            {/* Тело карточки — клик = перейти к услугам */}
            <div
                onClick={onSelect}
                style={{ padding: "14px 16px 8px", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.querySelector("div")!.style.color = "#444")}
                onMouseLeave={e => (e.currentTarget.querySelector("div")!.style.color = "#000")}
            >
                <div style={{ fontSize: 14, fontWeight: 700, color: "#000", letterSpacing: "-0.2px", transition: "color 0.1s" }}>
                    {company.Name}
                </div>
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>Нажмите, чтобы увидеть услуги →</div>
            </div>

            {/* Кнопки */}
            <div style={{ padding: "10px 16px 14px", display: "flex", gap: 6 }}>
                <button onClick={onUploadLogo} disabled={logoUploading !== null}
                    style={{ flex: 1, padding: "6px 0", border: "1px solid #e8e8e8", borderRadius: 4, background: "#fff", color: "#666", fontSize: 11, fontWeight: 500, cursor: logoUploading !== null ? "default" : "pointer", fontFamily: "inherit" }}
                    onMouseEnter={e => { if (logoUploading === null) { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#666"; }}
                >
                    Изменить фото
                </button>
                <button onClick={onEdit}
                    style={{ flex: 1, padding: "6px 0", border: "1px solid #e8e8e8", borderRadius: 4, background: "#fff", color: "#000", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#000")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#e8e8e8")}
                >
                    Переименовать
                </button>
                <button onClick={onDelete}
                    style={{ padding: "6px 10px", border: "1px solid #e8e8e8", borderRadius: 4, background: "#fff", color: "#ccc", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#ccc"; }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

// ── Детальный вид компании ───────────────────────────────────────────────────

function CompanyDetail({ company, logoVersion, onBack }: { company: Company; logoVersion?: number; onBack: () => void }) {
    const { items, loading, creating, handleCreate, handleUpdateService, handleDelete } = useMyServices();
    const [newTitle, setNewTitle] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    const services = items.filter(cs => cs.CompanyID === company.CompanyID);

    async function onSaveEdit() {
        if (editingServiceId == null) return;
        await handleUpdateService(editingServiceId, editingTitle);
        setEditingId(null);
    }

    return (
        <div>
            {/* Навигация назад */}
            <button
                onClick={onBack}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "#888", padding: 0, marginBottom: 32 }}
                onMouseEnter={e => (e.currentTarget.style.color = "#000")}
                onMouseLeave={e => (e.currentTarget.style.color = "#888")}
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Мои компании
            </button>

            {/* Шапка компании */}
            <div style={{ display: "flex", gap: 28, alignItems: "flex-start", marginBottom: 40, paddingBottom: 36, borderBottom: "1px solid #e8e8e8" }}>
                {/* Лого */}
                <div style={{ width: 280, flexShrink: 0, aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", border: "1px solid #e8e8e8" }}>
                    {company.logo_url ? (
                        <img src={`${BASE_URL}${company.logo_url}${logoVersion ? `?v=${logoVersion}` : ""}`} alt={company.Name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                        <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 56, letterSpacing: 2 }}>
                            {company.Name.trim()[0]?.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Инфо */}
                <div style={{ paddingTop: 8 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", margin: "0 0 8px" }}>{company.Name}</h1>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#000", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#666" }}>
                            {loading ? "Загрузка..." : `${services.length} ${services.length === 1 ? "услуга" : "услуг"}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Форма добавления услуги */}
            <form
                onSubmit={e => { e.preventDefault(); handleCreate(company.CompanyID, newTitle).then(() => setNewTitle("")); }}
                style={{ display: "flex", gap: 8, marginBottom: 32 }}
            >
                <input
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Название новой услуги"
                    style={{ flex: 1, padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fafafa" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.background = "#fff"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fafafa"; }}
                />
                <button type="submit" disabled={creating}
                    style={{ padding: "10px 22px", background: "#000", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: creating ? "default" : "pointer", fontFamily: "inherit", opacity: creating ? 0.5 : 1, flexShrink: 0 }}
                    onMouseEnter={e => { if (!creating) e.currentTarget.style.background = "#222"; }}
                    onMouseLeave={e => (e.currentTarget.style.background = "#000")}
                >
                    {creating ? "Добавление..." : "+ Добавить"}
                </button>
            </form>

            {/* Услуги */}
            {loading ? (
                <p style={{ fontSize: 14, color: "#999" }}>Загрузка...</p>
            ) : services.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>У компании пока нет услуг.</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                    {services.map(cs => {
                        const title = cs.Service?.Title || "Без названия";
                        const isEditing = editingId === cs.CompanyServiceID;
                        return (
                            <div key={cs.CompanyServiceID}
                                style={{ border: "1px solid #e8e8e8", borderRadius: 6, padding: "16px", display: "flex", flexDirection: "column", gap: 10, background: "#fff" }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)")}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                            >
                                {isEditing ? (
                                    <input
                                        value={editingTitle}
                                        onChange={e => setEditingTitle(e.target.value)}
                                        autoFocus
                                        style={{ padding: "8px 10px", border: "1px solid #000", borderRadius: 4, fontSize: 14, fontFamily: "inherit", outline: "none" }}
                                    />
                                ) : (
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "#000", lineHeight: 1.35, flex: 1 }}>{title}</div>
                                )}

                                <div style={{ display: "flex", gap: 6, borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
                                    {isEditing ? (
                                        <>
                                            <button onClick={onSaveEdit}
                                                style={{ flex: 1, padding: "6px 0", background: "#000", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                                Сохранить
                                            </button>
                                            <button onClick={() => setEditingId(null)}
                                                style={{ flex: 1, padding: "6px 0", background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                                                Отмена
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setEditingId(cs.CompanyServiceID); setEditingServiceId(cs.ServiceID); setEditingTitle(title); }}
                                                style={{ flex: 1, padding: "6px 0", border: "1px solid #e8e8e8", borderRadius: 4, background: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                                                onMouseEnter={e => (e.currentTarget.style.borderColor = "#000")}
                                                onMouseLeave={e => (e.currentTarget.style.borderColor = "#e8e8e8")}
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cs.CompanyServiceID)}
                                                style={{ flex: 1, padding: "6px 0", border: "1px solid #e8e8e8", borderRadius: 4, background: "#fff", color: "#999", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
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

// ── Главная страница ─────────────────────────────────────────────────────────

function CompaniesPage() {
    const {
        companies, loading, error, creating,
        handleCreate, handleUpdate, handleDelete,
        logoUploading, logoVersions, logoInputRef, openLogoUpload, handleLogoChange,
    } = useCompanies();

    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    function onSubmitCreate(e: React.FormEvent) {
        e.preventDefault();
        handleCreate(newName).then(() => setNewName(""));
    }

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return <div style={pageStyle}><span style={{ fontSize: 14 }}>{error}</span></div>;

    // Если выбрана компания — показываем её услуги
    if (selectedCompany) {
        // Передаём актуальные данные компании (логотип мог обновиться)
        const fresh = companies.find(c => c.CompanyID === selectedCompany.CompanyID) ?? selectedCompany;
        return (
            <div style={pageStyle}>
                <CompanyDetail company={fresh} logoVersion={logoVersions[fresh.CompanyID]} onBack={() => setSelectedCompany(null)} />
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={handleLogoChange} />

            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 8 }}>Мои компании</h1>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 32 }}>
                {companies.length} {companies.length === 1 ? "компания" : "компаний"}
            </p>

            {/* Форма создания */}
            <form onSubmit={onSubmitCreate} style={{ display: "flex", gap: 8, marginBottom: 40 }}>
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Название новой компании"
                    style={{ flex: 1, padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fafafa" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.background = "#fff"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fafafa"; }}
                />
                <button type="submit" disabled={creating}
                    style={{ padding: "10px 22px", background: "#000", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: creating ? "default" : "pointer", fontFamily: "inherit", opacity: creating ? 0.5 : 1, flexShrink: 0 }}
                    onMouseEnter={e => { if (!creating) e.currentTarget.style.background = "#222"; }}
                    onMouseLeave={e => (e.currentTarget.style.background = "#000")}
                >
                    {creating ? "Создание..." : "+ Добавить"}
                </button>
            </form>

            {/* Диалог переименования */}
            {editingId !== null && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setEditingId(null)}
                >
                    <div style={{ background: "#fff", borderRadius: 8, padding: "28px 32px", width: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Переименовать компанию</div>
                        <input
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            autoFocus
                            onKeyDown={async e => { if (e.key === "Enter") { await handleUpdate(editingId, editingName); setEditingId(null); } }}
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid #000", borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 16 }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={async () => { await handleUpdate(editingId, editingName); setEditingId(null); }}
                                style={{ flex: 1, padding: "10px 0", background: "#000", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                            >Сохранить</button>
                            <button onClick={() => setEditingId(null)}
                                style={{ flex: 1, padding: "10px 0", background: "#fff", color: "#000", border: "1px solid #e8e8e8", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                            >Отмена</button>
                        </div>
                    </div>
                </div>
            )}

            {companies.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>У вас пока нет компаний.</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                    {companies.map(c => (
                        <CompanyCard
                            key={c.CompanyID}
                            company={c}
                            logoUploading={logoUploading}
                            logoVersion={logoVersions[c.CompanyID]}
                            onSelect={() => setSelectedCompany(c)}
                            onEdit={() => { setEditingId(c.CompanyID); setEditingName(c.Name); }}
                            onDelete={() => handleDelete(c.CompanyID)}
                            onUploadLogo={() => openLogoUpload(c.CompanyID)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default CompaniesPage;
