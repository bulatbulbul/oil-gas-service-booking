import { useProfile } from "../hooks/useProfile";
import { BASE_URL } from "../api/client";

function ProfilePage() {
    const {
        me, loading, error, stats,
        avatarUploading, avatarVersion, avatarInputRef, handleAvatarChange,
        editing, editName, editEmail, setEditName, setEditEmail,
        saving, startEditing, cancelEditing, handleSave,
        handleLogout,
    } = useProfile();

    if (loading) return <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 32px" }}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error)   return <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 32px" }}><span style={{ fontSize: 14 }}>{error}</span></div>;

    const initials = me?.name?.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2) || "U";
    const avatarSrc = me?.avatar_url ? `${BASE_URL}${me.avatar_url}?v=${avatarVersion}` : null;

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 32px" }}>

            {/* ── Шапка с аватаром ─────────────────────────────────────── */}
            <div style={{ marginBottom: 48, borderBottom: "1px solid #000", paddingBottom: 32, display: "flex", alignItems: "center", gap: 28 }}>

                {/* Аватар */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                        style={{ width: 120, height: 120, borderRadius: 6, overflow: "hidden", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        onClick={() => avatarInputRef.current?.click()}
                        title="Изменить фото"
                    >
                        {avatarSrc ? (
                            <img src={avatarSrc} alt={initials} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : (
                            <span style={{ color: "#fff", fontWeight: 700, fontSize: 36, letterSpacing: "1px" }}>{initials}</span>
                        )}
                    </div>
                    <div style={{ position: "absolute", bottom: -4, right: -4, width: 20, height: 20, background: "#fff", border: "1px solid #e8e8e8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        onClick={() => avatarInputRef.current?.click()}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 9h2L8.5 2.5a1.414 1.414 0 00-2-2L1 7v2z" stroke="#000" strokeWidth="1" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                    {avatarUploading && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, fontSize: 10, color: "#000" }}>...</div>}
                </div>

                {/* Данные */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>
                        {me?.role === "admin" ? "Администратор" : "Пользователь"}
                    </div>

                    {editing ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="Имя"
                                style={{ fontSize: 18, fontWeight: 700, border: "none", borderBottom: "2px solid #000", outline: "none", padding: "2px 0", fontFamily: "inherit", width: "100%", letterSpacing: "-0.4px" }}
                            />
                            <input
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                                placeholder="Email"
                                style={{ fontSize: 13, border: "none", borderBottom: "1px solid #ccc", outline: "none", padding: "2px 0", fontFamily: "inherit", width: "100%", color: "#666" }}
                            />
                            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{ padding: "5px 16px", background: "#000", color: "#fff", border: "none", borderRadius: 2, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                                >
                                    {saving ? "..." : "Сохранить"}
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    style={{ padding: "5px 16px", background: "transparent", color: "#999", border: "1px solid #e8e8e8", borderRadius: 2, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.8px", color: "#000", lineHeight: 1.1 }}>
                                {me?.name || "Без имени"}
                            </div>
                            <div style={{ fontSize: 13, color: "#999", marginTop: 5 }}>
                                {me?.email || "Email не указан"}
                            </div>
                            <button
                                onClick={startEditing}
                                style={{ marginTop: 10, padding: "4px 12px", border: "1px solid #e8e8e8", borderRadius: 2, background: "#fff", fontSize: 11, color: "#666", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = "#000")}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = "#e8e8e8")}
                            >
                                Редактировать
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Мои бронирования ─────────────────────────────────────── */}
            {stats && (
                <div style={{ marginBottom: 48 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 16 }}>
                        Мои бронирования
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#e8e8e8", border: "1px solid #e8e8e8" }}>
                        {[
                            { label: "Всего броней", value: stats.total_bookings },
                            { label: "Активных",     value: stats.active_bookings },
                            { label: "Выполнено",    value: stats.completed_bookings },
                        ].map(s => (
                            <div key={s.label} style={{ background: "#fff", padding: "20px 24px", textAlign: "center" }}>
                                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-1px", color: "#000" }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Выход ────────────────────────────────────────────────── */}
            <button
                onClick={handleLogout}
                style={{ padding: "10px 24px", border: "1px solid #000", borderRadius: 2, background: "#fff", color: "#000", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f4f4f4")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
                Выйти из аккаунта
            </button>
        </div>
    );
}

export default ProfilePage;
