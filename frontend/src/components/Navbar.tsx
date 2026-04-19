import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../api/client";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { me, avatarVersion } = useUser();

    function handleLogout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        navigate("/login");
    }

    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    const isAuth = !!token;
    const isAdmin = role === "admin";

    if (!isAuth) return null;

    const linkStyle = (path: string): React.CSSProperties => {
        const active = location.pathname.startsWith(path);
        return {
            fontSize: 13,
            fontWeight: active ? 600 : 400,
            color: active ? "#000" : "#666",
            textDecoration: "none",
            paddingBottom: 2,
            borderBottom: active ? "1px solid #000" : "1px solid transparent",
            transition: "color 0.15s",
            letterSpacing: "0.1px",
        };
    };

    const initials = me?.name?.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2) || "U";
    const avatarSrc = me?.avatar_url
        ? `${BASE_URL}${me.avatar_url}?v=${avatarVersion}`
        : null;
    const isProfileActive = location.pathname.startsWith("/profile");

    return (
        <nav
            style={{
                padding: "0 32px",
                borderBottom: "1px solid #e8e8e8",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 24,
                height: 44,
            }}
        >
            <Link to="/search" style={linkStyle("/search")}>Поиск услуги</Link>
            <Link to="/bookings/my" style={linkStyle("/bookings/my")}>Мои брони</Link>
            <Link to="/bookings/company" style={linkStyle("/bookings/company")}>Входящие заявки</Link>
            <Link to="/companies" style={linkStyle("/companies")}>Мои компании</Link>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
                {isAdmin && (
                    <Link
                        to="/admin"
                        style={{
                            fontSize: 13,
                            fontWeight: location.pathname.startsWith("/admin") ? 600 : 400,
                            color: location.pathname.startsWith("/admin") ? "#000" : "#666",
                            textDecoration: "none",
                            paddingBottom: 2,
                            borderBottom: location.pathname.startsWith("/admin") ? "1px solid #000" : "1px solid transparent",
                        }}
                    >
                        Панель управления
                    </Link>
                )}

                {/* Avatar link to profile */}
                <Link
                    to="/profile"
                    title="Профиль"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        textDecoration: "none",
                        padding: "2px 0",
                        borderBottom: isProfileActive ? "1px solid #000" : "1px solid transparent",
                        paddingBottom: 2,
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            background: "#000",
                            borderRadius: 3,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 0 0 2px #000, 0 0 0 4px #fff",
                            transition: "box-shadow 0.15s",
                        }}
                    >
                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt={initials}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                        ) : (
                            <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.5px" }}>
                                {initials}
                            </span>
                        )}
                    </div>
                    <span style={{
                        fontSize: 13,
                        fontWeight: isProfileActive ? 600 : 400,
                        color: isProfileActive ? "#000" : "#666",
                    }}>
                        {me?.name?.split(" ")[0] || "Профиль"}
                    </span>
                </Link>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: "5px 14px",
                        border: "1px solid #000",
                        borderRadius: 2,
                        fontSize: 13,
                        fontWeight: 500,
                        background: "#fff",
                        color: "#000",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f4f4f4")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                >
                    Выйти
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
