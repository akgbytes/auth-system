import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux";
import { useLazyFetchUserQuery } from "@/redux/api/apiSlice";
import { logout, setCredentials } from "@/redux/features/authSlice";
import { useEffect } from "react";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useUser = () => {
  const dispatch = useAppDispatch();
  const [fetchUser, { data, isLoading, isError, isSuccess }] =
    useLazyFetchUserQuery();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setCredentials({ user: data.data }));
    }
    if (isError) {
      dispatch(logout());
    }
  }, [isSuccess, isError, data, dispatch]);

  return {
    data,
    isError,
    isLoading,
    isSuccess,
  };
};
