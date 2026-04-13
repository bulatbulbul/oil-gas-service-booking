import { Routes, Route, Link, useLocation } from "react-router-dom";
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
import AdminServiceRequestsPage from "./pages/AdminServiceRequestsPage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";

function App() {
    const location = useLocation();
    const hideChrome = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register";

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {!hideChrome && (
                <header style={{ borderBottom: "1px solid #e8e8e8", background: "#fff" }}>
                    <div
                        style={{
                            maxWidth: 1080,
                            margin: "0 auto",
                            padding: "0 32px",
                            height: 56,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <Link
                            to="/search"
                            style={{
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    background: "#000",
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: "0.5px",
                                }}
                            >
                                OG
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#000", letterSpacing: "-0.3px" }}>
                                OilGas Booking
                            </span>
                        </Link>
                    </div>
                </header>
            )}

            <Navbar />

            <main style={{ flex: 1 }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                    <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                    <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
                    <Route path="/admin/users/:id/bookings" element={<AdminRoute><AdminUserBookingsPage /></AdminRoute>} />
                    <Route path="/admin/service-requests" element={<AdminRoute><AdminServiceRequestsPage /></AdminRoute>} />
                    <Route path="/companies" element={<PrivateRoute><CompaniesPage /></PrivateRoute>} />
                    <Route path="/services" element={<PrivateRoute><ServicesPage /></PrivateRoute>} />
                    <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
                    <Route path="/bookings/:id" element={<PrivateRoute><BookingDetailsPage /></PrivateRoute>} />
                    <Route path="/bookings/my" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
                    <Route path="/search" element={<PrivateRoute><SearchServicesPage /></PrivateRoute>} />
                    <Route path="/my-services" element={<PrivateRoute><MyServicesPage /></PrivateRoute>} />

                    <Route path="*" element={<HomePage />} />
                </Routes>
            </main>

            {!hideChrome && (
                <footer
                    style={{
                        borderTop: "1px solid #e8e8e8",
                        padding: "16px 32px",
                        background: "#fff",
                    }}
                >
                    <p style={{ fontSize: 12, color: "#999", textAlign: "center" }}>
                        © 2026 OilGas Booking
                    </p>
                </footer>
            )}
        </div>
    );
}

export default App;
