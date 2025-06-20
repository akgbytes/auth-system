import { useAppSelector } from "@/hooks";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoutes = () => {
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  return isLoggedIn && user?.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export default AdminRoutes;
