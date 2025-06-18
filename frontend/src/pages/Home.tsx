import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks";
import { Lock, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const { data, isLoading } = useAuth();
  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-zinc-50 mt-12">
            Secure Authentication System
          </h1>
          <p className="text-xl text-zinc-400/90 mb-8 max-w-2xl mx-auto">
            A modern, secure authentication platform with advanced session
            management and administrative controls.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoading ? null : data ? (
              <Button
                size={"lg"}
                className="bg-teal-600 hover:bg-teal-700 cursor-pointer"
              >
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  size={"lg"}
                  className="bg-teal-600 hover:bg-teal-700 cursor-pointer"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="hover:bg-zinc-100/90"
                >
                  <Link to="/register">Create Account</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center bg-zinc-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12  bg-teal-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-zinc-50">
                Secure Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-300/70">
                Supports both custom auth and Google OAuth for improved security
                and user convenience.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-zinc-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-zinc-50">Session Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-300/70">
                Monitor and control active sessions across all devices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-zinc-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-zinc-50">Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-300/70">
                Comprehensive user management with role-based access control and
                analytics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-center">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
