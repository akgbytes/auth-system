import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  LogOut,
  Monitor,
  Smartphone,
  UserCog,
  Loader2,
} from "lucide-react";
import { useAppSelector } from "@/hooks";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  useFetchUserSessionsQuery,
  useLogoutAllMutation,
  useLogoutMutation,
  useLogoutSpecificSessionMutation,
} from "@/redux/api/apiSlice";
import { toast } from "react-toastify";

const Dashboard = () => {
  const userProfile = useAppSelector((state) => state.auth.user);

  const { data: sessionData, isLoading, refetch } = useFetchUserSessionsQuery();

  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();
  const [logoutAll, { isLoading: logoutAllLoading }] = useLogoutAllMutation();
  const [logoutSpecificSession] = useLogoutSpecificSessionMutation();

  const navigate = useNavigate();
  const logoutHandler = async () => {
    try {
      const response = await logout().unwrap();
      toast.success(response.message || "Logged out successfully.");
      navigate("/login");
    } catch (error: any) {
      toast.error(
        error.data?.message || "Error while logging out. Please try again."
      );
    }
  };

  const logoutAllHandler = async () => {
    try {
      const response = await logoutAll().unwrap();
      toast.success(response.message || "Logged out successfully.");
      refetch();
    } catch (error: any) {
      toast.error(
        error.data?.message || "Error while logging out. Please try again."
      );
    }
  };

  const logoutSpecificSessionHandler = async (id: string) => {
    try {
      const response = await logoutSpecificSession({ id }).unwrap();
      toast.success(response.message || "Logged out successfully.");
      refetch();
    } catch (error: any) {
      toast.error(
        error.data?.message || "Error while logging out. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-50">Dashboard</h1>
            <p className="text-zinc-400">Manage your account and sessions</p>
          </div>
          <div className="flex gap-6 text-zinc-900">
            {userProfile?.role === "admin" && (
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => navigate("/admin")}
              >
                <UserCog className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            )}
            <Button
              className="cursor-pointer text-zinc-700"
              variant={"outline"}
              disabled={logoutLoading}
              onClick={logoutHandler}
            >
              {logoutLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logout...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </Button>

            <Button
              className="cursor-pointer text-zinc-700"
              variant={"outline"}
              disabled={logoutAllLoading}
              onClick={logoutAllHandler}
            >
              {logoutAllLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logout...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout All
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-500">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-zinc-900 border-white/10 text-zinc-50">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={userProfile?.avatar!}
                      alt={`${userProfile?.fullname}`}
                    />
                  </Avatar>

                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Full Name
                        </label>
                        <p className="text-lg font-medium">
                          {userProfile?.fullname}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Account Role
                        </label>
                        <div className="mt-1">
                          <Badge variant="secondary">{userProfile?.role}</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email Address
                      </label>
                      <p className="text-lg">{userProfile?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Account ID
                      </label>
                      <p className="text-lg font-mono">{userProfile?.id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="bg-zinc-900 border-white/10 text-zinc-50">
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-8 w-[80px]" />
                      </div>
                    ))}
                  </div>
                ) : sessionData ? (
                  <Table className="text-zinc-50">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-zinc-50 font-bold">
                          Device
                        </TableHead>
                        <TableHead className="text-zinc-50 font-bold">
                          Location
                        </TableHead>
                        <TableHead className="text-zinc-50 font-bold">
                          IP Address
                        </TableHead>
                        <TableHead className="text-zinc-50 font-bold">
                          Last Active
                        </TableHead>
                        <TableHead className="text-zinc-50 font-bold">
                          Status
                        </TableHead>
                        <TableHead className="text-zinc-50 font-bold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionData.data &&
                        sessionData.data.map((session) => {
                          const Icon = session.device.includes("Mobile")
                            ? Smartphone
                            : Monitor;
                          return (
                            <TableRow
                              key={session.id}
                              className="hover:bg-zinc-800 cursor-pointer"
                            >
                              <TableCell className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {session.device}
                              </TableCell>
                              <TableCell>{session.location}</TableCell>
                              <TableCell>{session.ip}</TableCell>
                              <TableCell>{session.lastActive}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="default"
                                  className={
                                    session.current
                                      ? "bg-zinc-50 text-zinc-900"
                                      : session.status === "active"
                                      ? "bg-green-300 text-zinc-800"
                                      : "bg-red-400 text-zinc-50"
                                  }
                                >
                                  {session.current ? "current" : session.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {!session.current && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 cursor-pointer"
                                    onClick={() =>
                                      logoutSpecificSessionHandler(session.id)
                                    }
                                  >
                                    <LogOut className="h-4 w-4 mr-1" />
                                    Logout
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
