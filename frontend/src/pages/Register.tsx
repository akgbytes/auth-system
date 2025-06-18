import { useForm, type SubmitHandler } from "react-hook-form";
import {
  useGoogleLoginMutation,
  useLazyFetchUserQuery,
  useRegisterMutation,
} from "@/redux/api/apiSlice";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { useState } from "react";
import type { RegisterFormData } from "@/types";
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
import { Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus } from "lucide-react";
import { setCredentials } from "@/redux/features/authSlice";
import { useAppDispatch } from "@/hooks";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [registerUser, { isLoading }] = useRegisterMutation();
  const [googleLogin] = useGoogleLoginMutation();
  const [getProfile] = useLazyFetchUserQuery();

  const [avatar, setAvatar] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      setAvatar(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    const formData = new FormData();
    formData.append("fullname", data.fullname);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (avatar) formData.append("avatar", avatar);

    try {
      const response = await registerUser(formData).unwrap();
      toast.success(response.message);

      console.log("Register response: ", response);
      navigate("/login");
    } catch (error: any) {
      toast.error(error.data?.message);
      console.log("Register error: ", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <Card className="w-full bg-zinc-900 max-w-md border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-zinc-50">
            Create your account
          </CardTitle>
          <CardDescription className="text-zinc-300/70">
            Join us today and get started
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
                toast.error(error?.data?.message);
              }
            }}
            onError={() => toast.error("Login Failed")}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-300/70">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar upload */}
            <div>
              <div
                {...getRootProps()}
                className="cursor-pointer border-1 border-dashed rounded-lg p-4 text-center border-white/20 bg-zinc-900 text-zinc-200"
              >
                <input {...getInputProps()} />
                {avatar ? (
                  <p>{avatar.name}</p>
                ) : isDragActive ? (
                  <p>Drop the file here ...</p>
                ) : (
                  <p>Drag & drop avatar or click to upload</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-50">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("fullname", {
                    required: "Full name is required",
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 border rounded-md border-white/10 bg-zinc-900 text-zinc-200 focus-visible:ring-zinc-50 focus-visible:ring-[1px]"
                />
              </div>

              {errors.fullname && (
                <p className="text-red-500 text-sm">
                  {errors.fullname.message}
                </p>
              )}
            </div>
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
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border rounded-md border-white/10 bg-zinc-900 text-zinc-200 focus-visible:ring-zinc-50 focus-visible:ring-[1px]"
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
                  placeholder="Enter your password"
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

            <Button
              type="submit"
              className="w-full cursor-pointer py-5 rounded-[4px] text-zinc-700"
              variant={"outline"}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-zinc-300/60">Already have an account? </span>
            <Link
              to="/login"
              className="hover:underline text-zinc-200 font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
