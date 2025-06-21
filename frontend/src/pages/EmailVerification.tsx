import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import {
  useLazyFetchUserQuery,
  useVerifyEmailQuery,
} from "@/redux/api/apiSlice";
import { useAppDispatch } from "@/hooks";
import { setCredentials } from "@/redux/features/authSlice";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [countdown, setCountdown] = useState(5);

  const { data, isLoading, isSuccess, isError } = useVerifyEmailQuery(token!, {
    skip: !token,
  });

  const [getProfile] = useLazyFetchUserQuery();

  const verifyAndFetchProfile = async () => {
    if (isLoading) {
      setVerificationStatus("loading");
    } else if (isSuccess && data?.success) {
      toast.success(data.message || "Email verified successful.");
      setVerificationStatus("success");

      try {
        const user = await getProfile().unwrap();
        let seconds = 5;
        setCountdown(seconds);

        const interval = setInterval(() => {
          seconds -= 1;
          setCountdown(seconds);
          if (seconds <= 0) clearInterval(interval);
        }, 1000);

        setTimeout(() => {
          dispatch(
            setCredentials({
              user: user.data,
            })
          );
          toast.success("Login successful");
          navigate("/dashboard");
        }, 5000);
      } catch (error: any) {
        toast.error(error.data.message);
      }
    } else if (isError) {
      toast.error("Email verification failed");
      setVerificationStatus("error");
    }
  };

  useEffect(() => {
    verifyAndFetchProfile();
  }, [isLoading]);

  const renderContent = () => {
    switch (verificationStatus) {
      case "loading":
        return (
          <div className="text-center text-zinc-50 space-y-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-zinc-200" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Verifying your email
              </h2>
              <p className="text-zinc-300/70">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-200 mb-2">
                Email Verified!
              </h2>
              <p className="text-zinc-300/70">
                Your email has been successfully verified. You can now access
                all features of your account.
              </p>
              <p className="text-sm text-zinc-100 mt-2">
                Redirecting to your dashboard in{" "}
                <span className="font-medium">{countdown}</span> second
                {countdown !== 1 && "s"}...
              </p>
            </div>
            <Link to="/login">
              <Button className="w-full cursor-pointer" variant={"outline"}>
                Continue to Login
              </Button>
            </Link>
          </div>
        );

      case "error":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-200 mb-2">
                Verification Failed
              </h2>
              <p className="text-zinc-300/70">
                We couldn't verify your email. The link may be invalid or
                expired.
              </p>
            </div>
            <Link to="/resend-verification">
              <Button className="w-full cursor-pointer" variant={"outline"}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Verification Email
              </Button>
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <Card className="w-full max-w-md bg-zinc-900 border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-zinc-50">
            Email Verification
          </CardTitle>
          <CardDescription className="text-zinc-300/70">
            Verify your email address to complete registration
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">{renderContent()}</CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
