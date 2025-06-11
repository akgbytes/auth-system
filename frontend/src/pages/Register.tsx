import { useForm, type SubmitHandler } from "react-hook-form";
import {
  useGoogleLoginMutation,
  useRegisterMutation,
} from "@/redux/api/apiSlice";
import { useDispatch } from "react-redux";

import { useDropzone } from "react-dropzone";

import { toast } from "react-toastify";
import { FaGoogle } from "react-icons/fa";

import { useState } from "react";
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
import { Loader2, UserPlus } from "lucide-react";

import type { RegisterFormData } from "@/types";
import { Separator } from "@/components/ui/separator";
import { useGoogleLogin } from "@react-oauth/google";

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const navigate = useNavigate();

  const [avatar, setAvatar] = useState<File | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [registerUser, { isLoading }] = useRegisterMutation();
  const [googleLogin] = useGoogleLoginMutation();

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
      toast.success("Registration successful!");
      console.log("Register response: ", response);
    } catch (error: any) {
      console.log("Register error: ", error);
      toast.error(error?.data?.message || "Registration failed");
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async ({ expires_in, access_token }) => {
      try {
        console.log("google response: ", access_token, expires_in);
        const response = await googleLogin({ token: access_token }).unwrap();
        console.log("Google response from backend: ", response);
        toast.success("Google login successful!");
        navigate("/dashboard");
      } catch (error: any) {
        console.log("Error while google login from backend: ", error);
        toast.error(error?.data?.message || "Google login error");
      }
    },
    onError: () => toast.error("Google login failed"),
  });
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Sign up to get started with our platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => loginWithGoogle()}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FaGoogle />
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Dropzone */}
            <div>
              <div
                {...getRootProps()}
                className="cursor-pointer border-2 border-dashed rounded-lg p-4 text-center bg-zinc-100 dark:bg-zinc-800 hover:border-blue-500"
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                {...register("fullname", {
                  required: "Full name is required",
                  minLength: { value: 6, message: "Min 6 characters" },
                })}
                className="w-full px-3 py-2 border rounded bg-zinc-100 dark:bg-zinc-800"
              />
              {errors.fullname && (
                <p className="text-red-500 text-sm">
                  {errors.fullname.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-3 py-2 border rounded bg-zinc-100 dark:bg-zinc-800"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Min 6 characters" },
                })}
                className="w-full px-3 py-2 border rounded bg-zinc-100 dark:bg-zinc-800"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600"
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
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
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
