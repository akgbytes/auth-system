import { useForm, type SubmitHandler } from "react-hook-form";
import { useResendVerificationMutation } from "@/redux/api/apiSlice";

import { toast } from "react-toastify";
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
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, RefreshCw, Send } from "lucide-react";

import type { ResendVerificationFormData } from "@/types";

const ResendVerificationEmail = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResendVerificationFormData>();

  const [resendVerification, { isLoading }] = useResendVerificationMutation();

  const [emailSent, setEmailSent] = useState(false);

  const onSubmit: SubmitHandler<ResendVerificationFormData> = async (data) => {
    try {
      const response = await resendVerification(data).unwrap();
      setEmailSent(true);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.data?.message);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <Card className="w-full bg-zinc-900 max-w-md border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-zinc-50">
              Verification email sent
            </CardTitle>
            <CardDescription className="text-zinc-300/75">
              Check your email for the new verification link
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <Card className="border-white/10 pt-0 text-center w-full bg-zinc-900">
              <CardContent className="pt-6 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-zinc-800 p-4 rounded-full">
                    <Mail className="h-12 w-12 text-zinc-50" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                    Verification email sent
                  </h3>
                  <p className="text-zinc-300/75 text-sm">
                    We've sent a verification link to{" "}
                    <strong className="text-zinc-100 font-medium">
                      {getValues("email")}
                    </strong>
                    . Please check your email and click the link to verify your
                    account.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-zinc-300/75 text-sm">
                    Still didn't receive it? Check your spam folder or try again
                    in a few minutes.
                  </p>
                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="w-full cursor-pointer py-5 rounded-[4px] text-zinc-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Send again
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10 mt-6">
              <CardContent className="pt-0 text-center space-y-2">
                <p className="text-zinc-300/75 text-sm">
                  Already verified?{" "}
                  <Link to="/login" className="text-zinc-100 hover:underline">
                    Go to login
                  </Link>
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <Card className="w-full max-w-md bg-zinc-900 border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-zinc-50">
            Resend verification email
          </CardTitle>
          <CardDescription className="text-zinc-300/75">
            Enter your email to receive a new verification link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-zinc-900 border-white/10 mb-6">
            <CardContent className="">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-zinc-50 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-zinc-200 mb-1">
                    Need to verify your email?
                  </h4>
                  <p className="text-xs text-zinc-300/75">
                    If you didn't receive the verification email or if it
                    expired, you can request a new one using the form below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  placeholder="aditya@example.com"
                  className="w-full pl-10 pr-4 py-3 border rounded border-white/10 bg-zinc-900 text-zinc-200 focus-visible:ring-zinc-50 focus-visible:ring-[1px]"
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}

              <p className="text-xs text-zinc-300/75 mt-1">
                Enter the email address you used to register your account.
              </p>
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
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Verification Email
                </>
              )}
            </Button>
          </form>

          <Card className="bg-zinc-900 border-white/10 ">
            <CardContent className="text-center space-y-1">
              <p className="text-zinc-300/60 text-sm">
                <Link
                  to="/login"
                  className="hover:text-zinc-200 inline-flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Link>
              </p>
              <p className="text-zinc-300/60 text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-zinc-100 hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResendVerificationEmail;
