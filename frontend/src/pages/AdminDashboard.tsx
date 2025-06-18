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
import {
  Users,
  Search,
  LogOut,
  Monitor,
  Smartphone,
  Globe,
  Shield,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [users] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "User",
      status: "Active",
      lastLogin: "2 minutes ago",
      sessionsCount: 3,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "User",
      status: "Active",
      lastLogin: "1 hour ago",
      sessionsCount: 1,
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "Admin",
      status: "Inactive",
      lastLogin: "2 days ago",
      sessionsCount: 0,
    },
    {
      id: "4",
      name: "Alice Wilson",
      email: "alice.wilson@example.com",
      role: "User",
      status: "Active",
      lastLogin: "30 minutes ago",
      sessionsCount: 2,
    },
  ]);

  const [userSessions] = useState({
    "1": [
      {
        id: "1-1",
        device: "Desktop - Chrome",
        location: "New York, USA",
        ip: "192.168.1.1",
        lastActive: "2 minutes ago",
        icon: Monitor,
      },
      {
        id: "1-2",
        device: "Mobile - Safari",
        location: "New York, USA",
        ip: "192.168.1.2",
        lastActive: "1 hour ago",
        icon: Smartphone,
      },
      {
        id: "1-3",
        device: "Desktop - Firefox",
        location: "Los Angeles, USA",
        ip: "10.0.0.1",
        lastActive: "3 days ago",
        icon: Globe,
      },
    ],
    "2": [
      {
        id: "2-1",
        device: "Mobile - Chrome",
        location: "Boston, USA",
        ip: "192.168.2.1",
        lastActive: "1 hour ago",
        icon: Smartphone,
      },
    ],
    "4": [
      {
        id: "4-1",
        device: "Desktop - Safari",
        location: "Seattle, USA",
        ip: "10.1.0.1",
        lastActive: "30 minutes ago",
        icon: Monitor,
      },
      {
        id: "4-2",
        device: "Tablet - Chrome",
        location: "Seattle, USA",
        ip: "10.1.0.2",
        lastActive: "2 hours ago",
        icon: Globe,
      },
    ],
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewSessions = (user: any) => {
    setSelectedUser(user);
    setIsSessionModalOpen(true);
  };

  const handleLogoutUserSession = (sessionId: string, device: string) => {
    // toast({
    //   title: "Session Terminated",
    //   description: `Logged out user from ${device}`,
    // });
  };

  const handleLogoutAllUserSessions = () => {
    // toast({
    //   title: "All Sessions Terminated",
    //   description: `All sessions for ${selectedUser?.name} have been terminated`,
    // });
    setIsSessionModalOpen(false);
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
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  {filteredUsers.map((user) => (
                    <TableRow
                      className="hover:bg-zinc-800 cursor-pointer"
                      key={user.id}
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "Admin" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "Active" ? "default" : "destructive"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>{user.sessionsCount}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSessions(user)}
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Sessions for {selectedUser?.name}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogoutAllUserSessions}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout All Sessions
                </Button>
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
                  {selectedUser &&
                    userSessions[
                      selectedUser.id as keyof typeof userSessions
                    ]?.map((session) => {
                      const IconComponent = session.icon;
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {session.device}
                          </TableCell>
                          <TableCell>{session.location}</TableCell>
                          <TableCell>{session.ip}</TableCell>
                          <TableCell>{session.lastActive}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleLogoutUserSession(
                                  session.id,
                                  session.device
                                )
                              }
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
