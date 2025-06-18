import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux";
import { useFetchUserQuery } from "@/redux/api/apiSlice";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useAuth = () => {
  const { data, isError, isLoading } = useFetchUserQuery();
  return {
    data,
    isError,
    isLoading,
  };
};
