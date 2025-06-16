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
import { User, Settings, LogOut, Monitor, Smartphone } from "lucide-react";
import { useAppSelector } from "@/hooks";
import { useGetSessionsQuery } from "@/redux/api/apiSlice";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const userProfile = useAppSelector((state) => state.auth.user);

  console.log("User profile: ", userProfile);

  const { data, isLoading } = useGetSessionsQuery();
  console.log("data: ", data);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your account and sessions
            </p>
          </div>
          <Button variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout All Sessions
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
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
            <Card>
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
            <Card>
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
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data!.data &&
                        data!.data.map((session) => {
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
                                {session.current ? (
                                  <Badge variant="default">Current</Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    {session.status}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {!session.current && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {}}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
