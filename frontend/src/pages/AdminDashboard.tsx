import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Search, LogOut, Monitor, Smartphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useLogoutUserSessionMutation,
  useLazyFetchUserSessionQuery,
  useFetchAllUsersQuery,
} from "../redux/api/apiSlice";

const AdminDashboard = () => {
  const {
    data: users,
    isLoading,
    isSuccess,
    refetch,
  } = useFetchAllUsersQuery();

  const [logoutUser, {}] = useLogoutUserSessionMutation();
  const [
    fetchUserSession,
    {
      data: sessionData,
      isSuccess: isSessionSuccess,
      isLoading: isSessionLoading,
    },
  ] = useLazyFetchUserSessionQuery();

  const logoutUserHandler = async (sessionId: string) => {
    try {
      const response = await logoutUser({ id: sessionId }).unwrap();

      toast.success(response.message || "Logged out successfully.");
      refetch();
      setIsSessionModalOpen(false);
    } catch (error: any) {
      toast.error(
        error.data.message || "Error while logging out. Please try again."
      );
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const filteredUsers = users?.data.filter(
    (user) =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewSessionsHandler = async (user: any) => {
    setSelectedUser(user.fullname);
    setIsSessionModalOpen(true);
    try {
      await fetchUserSession({ id: user.id }).unwrap();
    } catch (error: any) {}
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-50 flex items-center gap-2">
              Admin Dashboard
            </h1>
            <p className="text-zinc-400">Manage users and their sessions</p>
          </div>
        </div>
        <Card className="bg-zinc-900 border-white/10 text-zinc-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              User Management
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    if (isSuccess) {
                      setSearchTerm(e.target.value);
                    }
                    return;
                  }}
                  className="pl-8"
                />
              </div>
            </div>
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
            ) : (
              <Table className="text-zinc-50">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-50 font-bold">
                      Name
                    </TableHead>
                    <TableHead className="text-zinc-50 font-bold">
                      Email
                    </TableHead>
                    <TableHead className="text-zinc-50 font-bold">
                      Role
                    </TableHead>
                    <TableHead className="text-zinc-50 font-bold">
                      Status
                    </TableHead>
                    <TableHead className="text-zinc-50 font-bold">
                      Last Login
                    </TableHead>
                    <TableHead className="text-zinc-50 font-bold">
                      Sessions
                    </TableHead>
                    <TableHead className="text-zinc-50 font-bold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow
                      className="hover:bg-zinc-800 cursor-pointer"
                      key={user.id}
                    >
                      <TableCell className="font-medium">
                        {user.fullname}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.role === "admin"
                              ? "bg-rose-600 w-14 text-zinc-50"
                              : "bg-zinc-50 text-zinc-800 w-14"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.status}</TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell className="pl-8">
                        {user.sessionsCount}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          className="text-zinc-900 cursor-pointer"
                          size="sm"
                          onClick={() => {
                            viewSessionsHandler(user);
                          }}
                          disabled={user.sessionsCount === 0}
                        >
                          View Sessions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
          <DialogContent className="min-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between -mt-2">
                <span className="block">Sessions for {selectedUser}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSessionLoading && <div>Loading...</div>}
                  {selectedUser &&
                    isSessionSuccess &&
                    sessionData?.data.map((session) => {
                      const Icon = session.device.includes("Mobile")
                        ? Smartphone
                        : Monitor;
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {session.device}
                          </TableCell>
                          <TableCell>{session.location}</TableCell>
                          <TableCell>{session.ip}</TableCell>
                          <TableCell>{session.lastActive}</TableCell>
                          <TableCell>
                            <Button
                              className="cursor-pointer"
                              variant="destructive"
                              size="sm"
                              onClick={() => logoutUserHandler(session.id)}
                            >
                              <LogOut className="h-4 w-4 mr-1" />
                              Logout
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
