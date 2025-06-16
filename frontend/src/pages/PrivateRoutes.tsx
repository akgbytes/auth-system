import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks";

const PrivateRoutes = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoutes;
