import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks";

const PrivateRoutes = () => {
  const { isLoggedIn } = useAppSelector((state) => state.auth);

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoutes;
