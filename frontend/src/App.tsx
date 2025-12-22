import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CompaniesPage from "./pages/CompaniesPage";
import ServicesPage from "./pages/ServicesPage";
import BookingsPage from "./pages/BookingsPage";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import AdminPage from "./pages/AdminPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import RegisterPage from "./pages/RegisterPage";
import SearchServicesPage from "./pages/SearchServicesPage";
import MyServicesPage from "./pages/MyServicesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminUserBookingsPage from "./pages/AdminUserBookingsPage";
import HomePage from "./pages/HomePage";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

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

    const linkStyle = (path: string) => {
        const active = location.pathname.startsWith(path);
        return {
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 14,
            textDecoration: "none",
            fontWeight: 500,
            color: active ? "#1d4ed8" : "#4b5563",
            backgroundColor: active ? "#e5effe" : "transparent",
        } as React.CSSProperties;
    };

    return (
        <nav
            style={{
                padding: "8px 24px",
                borderBottom: "1px solid #e5e7eb",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: 12,
            }}
        >
            <Link to="/companies" style={linkStyle("/companies")}>
                Мои компании
            </Link>
            <Link to="/my-services" style={linkStyle("/my-services")}>
                Мои услуги
            </Link>
            <Link to="/bookings/my" style={linkStyle("/bookings/my")}>
                Мои брони
            </Link>
            <Link to="/search" style={linkStyle("/search")}>
                Поиск услуги
            </Link>

            <div
                style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                {isAdmin && (
                    <Link
                        to="/admin"
                        style={{
                            padding: "6px 12px",
                            borderRadius: 999,
                            fontSize: 14,
                            textDecoration: "none",
                            fontWeight: 500,
                            color: "#b91c1c",
                            backgroundColor: "#fee2e2",
                        }}
                    >
                        Админка
                    </Link>
                )}

                <Link
                    to="/profile"
                    style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        fontSize: 14,
                        textDecoration: "none",
                        fontWeight: 500,
                        color: "#111827",
                        backgroundColor: "#e5e7eb",
                    }}
                >
                    Личный кабинет
                </Link>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "none",
                        fontSize: 14,
                        fontWeight: 500,
                        background: "#f97373",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    Выход
                </button>
            </div>
        </nav>
    );
}

function App() {
    const location = useLocation();
    const hideHeader = location.pathname === "/login" || location.pathname === "/register";
    const hideFooter = location.pathname === "/";

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Минималистичный header */}
            {!hideHeader && (
                <header
                    style={{
                        padding: "10px 24px",
                        background: "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                    }}
                >
                    <div
                        style={{
                            maxWidth: 1200,
                            margin: "0 auto",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "999px",
                                background: "#2563eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            OG
                        </div>
                        <span
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#0f172a",
                            }}
                        >
              OilGas Booking
            </span>
                    </div>
                </header>
            )}

            {/* Navbar */}
            <Navbar />

            <main style={{ flex: 1 }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <ProfilePage />
                            </PrivateRoute>
                        }
                    />

                    {/* Админка */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminPage />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/users"
                        element={
                            <AdminRoute>
                                <AdminUsersPage />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/analytics"
                        element={
                            <AdminRoute>
                                <AdminAnalyticsPage />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/users/:id/bookings"
                        element={
                            <AdminRoute>
                                <AdminUserBookingsPage />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/companies"
                        element={
                            <PrivateRoute>
                                <CompaniesPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/services"
                        element={
                            <PrivateRoute>
                                <ServicesPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/bookings"
                        element={
                            <PrivateRoute>
                                <BookingsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/bookings/:id"
                        element={
                            <PrivateRoute>
                                <BookingDetailsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/bookings/my"
                        element={
                            <PrivateRoute>
                                <MyBookingsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/search"
                        element={
                            <PrivateRoute>
                                <SearchServicesPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/my-services"
                        element={
                            <PrivateRoute>
                                <MyServicesPage />
                            </PrivateRoute>
                        }
                    />

                    <Route path="*" element={<HomePage />} />
                </Routes>
            </main>

            {/* Footer */}
            {!hideFooter && (
                <footer
                    style={{
                        padding: 20,
                        background: "#f8f9fa",
                        textAlign: "center",
                        borderTop: "1px solid #ddd",
                        marginTop: "auto",
                    }}
                >
                    <p style={{ margin: 0, color: "#6c757d" }}>
                        &copy; 2025 OilGas Booking. Все права защищены.
                    </p>
                </footer>
            )}
        </div>
    );
}

export default App;
