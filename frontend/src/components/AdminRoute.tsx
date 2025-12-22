import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    if (!token) return <Navigate to="/login" replace />;
    if (role !== "admin") return <Navigate to="/search" replace />;

    return <>{children}</>;
};

export default AdminRoute;
