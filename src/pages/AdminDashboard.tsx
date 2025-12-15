import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Heart,
  MessageSquare,
  Calendar,
  TrendingUp,
  UserPlus,
  Image,
  FileText,
  Link2,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Home,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Analytics {
  total_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  active_users_today: number;
  active_users_this_month: number;
  total_families: number;
  total_family_members: number;
  avg_family_size: number;
  total_memories: number;
  memories_with_photos: number;
  memories_text_only: number;
  total_reactions: number;
  total_comments: number;
  avg_reactions_per_memory: number;
  avg_comments_per_memory: number;
  total_connections: number;
  total_invitations: number;
  pending_invitations: number;
  accepted_invitations: number;
}

interface UserData {
  id: string;
  full_name: string | null;
  signup_date: string;
  last_login_at: string | null;
  family_members_count: number;
  memories_count: number;
  comments_count: number;
  is_admin: boolean;
}

interface UserListResponse {
  users: UserData[] | null;
  total_count: number;
  page: number;
  page_size: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  async function fetchAnalytics() {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    
    try {
      const { data, error } = await supabase.rpc('get_admin_analytics');
      
      if (error) throw error;
      setAnalytics(data as unknown as Analytics);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setAnalyticsError(err.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function fetchUsers() {
    setUsersLoading(true);
    setUsersError(null);
    
    try {
      const { data, error } = await supabase.rpc('get_admin_user_list', {
        search_term: searchTerm || null,
        page_num: currentPage,
        page_size: pageSize,
      });
      
      if (error) throw error;
      
      const response = data as unknown as UserListResponse;
      setUsers(response.users || []);
      setTotalUsers(response.total_count || 0);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setUsersError(err.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }

  const totalPages = Math.ceil(totalUsers / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2">
                <Shield className="h-7 w-7 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">HomeTime Analytics & User Management</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Back to App
          </Button>
        </div>

        {/* Analytics Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Platform Analytics</h2>
          
          {analyticsError && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive">{analyticsError}</p>
                <Button variant="outline" onClick={fetchAnalytics} className="mt-2">
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* User Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              title="Total Users"
              value={analytics?.total_users}
              loading={analyticsLoading}
            />
            <StatCard
              icon={<UserPlus className="h-5 w-5" />}
              title="New Today"
              value={analytics?.new_users_today}
              loading={analyticsLoading}
              variant="success"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="New This Week"
              value={analytics?.new_users_this_week}
              loading={analyticsLoading}
            />
            <StatCard
              icon={<Calendar className="h-5 w-5" />}
              title="New This Month"
              value={analytics?.new_users_this_month}
              loading={analyticsLoading}
            />
          </div>

          {/* Activity Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              title="Active Today"
              value={analytics?.active_users_today}
              loading={analyticsLoading}
              variant="primary"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="MAU"
              value={analytics?.active_users_this_month}
              loading={analyticsLoading}
              description="Monthly Active Users"
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              title="Total Families"
              value={analytics?.total_families}
              loading={analyticsLoading}
            />
            <StatCard
              icon={<Heart className="h-5 w-5" />}
              title="Avg Family Size"
              value={analytics?.avg_family_size}
              loading={analyticsLoading}
              suffix=" members"
            />
          </div>

          {/* Content Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<FileText className="h-5 w-5" />}
              title="Total Memories"
              value={analytics?.total_memories}
              loading={analyticsLoading}
            />
            <StatCard
              icon={<Image className="h-5 w-5" />}
              title="Photo Memories"
              value={analytics?.memories_with_photos}
              loading={analyticsLoading}
              variant="primary"
            />
            <StatCard
              icon={<Heart className="h-5 w-5" />}
              title="Total Reactions"
              value={analytics?.total_reactions}
              loading={analyticsLoading}
            />
            <StatCard
              icon={<MessageSquare className="h-5 w-5" />}
              title="Total Comments"
              value={analytics?.total_comments}
              loading={analyticsLoading}
            />
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Heart className="h-5 w-5" />}
              title="Avg Reactions/Memory"
              value={analytics?.avg_reactions_per_memory}
              loading={analyticsLoading}
            />
            <StatCard
              icon={<MessageSquare className="h-5 w-5" />}
              title="Avg Comments/Memory"
              value={analytics?.avg_comments_per_memory}
              loading={analyticsLoading}
            />
            <StatCard
              icon={<Link2 className="h-5 w-5" />}
              title="Connections"
              value={analytics?.total_connections}
              loading={analyticsLoading}
            />
            <StatCard
              icon={<Calendar className="h-5 w-5" />}
              title="Invitations Sent"
              value={analytics?.total_invitations}
              loading={analyticsLoading}
              description={`${analytics?.accepted_invitations || 0} accepted`}
            />
          </div>
        </div>

        {/* User Management Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>
              View and search registered users (non-sensitive data only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {usersError && (
              <div className="text-destructive p-4 bg-destructive/10 rounded-lg">
                {usersError}
                <Button variant="outline" size="sm" onClick={fetchUsers} className="ml-2">
                  Retry
                </Button>
              </div>
            )}

            {/* Users Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User</TableHead>
                    <TableHead>Signup Date</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-center">Family</TableHead>
                    <TableHead className="text-center">Memories</TableHead>
                    <TableHead className="text-center">Comments</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {user.id.substring(0, 8)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(user.signup_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.last_login_at
                            ? format(new Date(user.last_login_at), 'MMM d, yyyy')
                            : <span className="text-muted-foreground">Never</span>
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{user.family_members_count}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{user.memories_count}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{user.comments_count}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <Badge className="bg-primary text-primary-foreground">Admin</Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | undefined;
  loading: boolean;
  variant?: 'default' | 'primary' | 'success';
  suffix?: string;
  description?: string;
}

function StatCard({ icon, title, value, loading, variant = 'default', suffix = '', description }: StatCardProps) {
  const bgClass = variant === 'primary' 
    ? 'bg-primary/10' 
    : variant === 'success' 
      ? 'bg-green-500/10' 
      : 'bg-card';
  
  const iconClass = variant === 'primary' 
    ? 'text-primary' 
    : variant === 'success' 
      ? 'text-green-600' 
      : 'text-muted-foreground';

  return (
    <Card className={`${bgClass} shadow-card`}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className={iconClass}>{icon}</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </span>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div>
            <p className="text-2xl font-bold text-foreground">
              {value ?? 0}{suffix}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
