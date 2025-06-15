import { useForm, type SubmitHandler } from "react-hook-form";
import {
  useGoogleLoginMutation,
  useLazyGetProfileQuery,
  useLoginMutation,
} from "@/redux/api/apiSlice";

import { toast } from "react-toastify";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { setCredentials } from "@/redux/features/authSlice";
import { useAppDispatch } from "@/hooks";
import type { LoginFormData } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin] = useGoogleLoginMutation();
  const [getProfile] = useLazyGetProfileQuery();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const response = await login(data).unwrap();
      console.log("Login response: ", response);

      const user = await getProfile().unwrap();
      console.log("get profile response: ", user);

      dispatch(
        setCredentials({
          user: user.data,
        })
      );

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error?.data?.message || "Login failed");
      console.log("Login error: ", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <Card className="w-full bg-zinc-900 max-w-md border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-zinc-50">
            Welcome back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <GoogleLogin
            theme="outline"
            text="continue_with"
            onSuccess={async (credentialResponse) => {
              try {
                const idToken = credentialResponse.credential;
                const response = await googleLogin({
                  token: idToken!,
                  rememberMe,
                }).unwrap();

                console.log("google response from backend: ", response);

                const user = await getProfile().unwrap();

                console.log("get profile response: ", user);

                dispatch(
                  setCredentials({
                    user: user.data,
                  })
                );

                toast.success("Login successful");
                navigate("/dashboard");
              } catch (error: any) {
                console.log("google error from backend : ", error);
                toast.error(error.data.message);
              }
            }}
            onError={() => toast.error("Login Failed")}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-50">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 border rounded border-white/10 bg-zinc-900 text-zinc-200 focus-visible:ring-zinc-50 focus-visible:ring-[1px]"
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-50">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 border rounded border-white/10 bg-zinc-900 text-zinc-200 focus-visible:ring-zinc-50 focus-visible:ring-[1px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-zinc-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  className=""
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-zinc-200 hover:text-zinc-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer "
              variant={"outline"}
              disabled={isLoading}
            >
              {isLoading ? (
                //     <>
                //       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                //       Signing In...
                //     </>
                //   ) : (
                //     <>
                //       <LogIn className="h-4 w-4 mr-2" />
                //       Sign In
                //     </>
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="flex flex-col gap-2">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                to="/register"
                className="hover:underline text-zinc-200 font-medium"
              >
                Sign up
              </Link>
            </div>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Need to verify your email?{" "}
              </span>
              <Link
                to="/resend-verification"
                className="hover:underline text-zinc-200 font-medium"
              >
                Resend verification
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
