import { Navigate } from "react-router-dom";

type Props = {
    children: JSX.Element;
};

function PrivateRoute({ children }: Props) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default PrivateRoute;
