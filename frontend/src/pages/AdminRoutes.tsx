import { useAppSelector } from "@/hooks";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoutes = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return isAuthenticated && user?.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export default AdminRoutes;
