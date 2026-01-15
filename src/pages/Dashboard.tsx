import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, LogOut, Map, MessageSquare, Bell, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
interface DashboardStats {
  farmCount: number;
  avgNdvi: number | null;
  alertCount: number;
}
const Dashboard = () => {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    farmCount: 0,
    avgNdvi: null,
    alertCount: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshingNdvi, setRefreshingNdvi] = useState(false);
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);
  const fetchStats = async () => {
    try {
      // Fetch farm count
      const {
        data: farms,
        error: farmsError
      } = await supabase.from('farms').select('id').eq('user_id', user!.id);
      if (farmsError) console.error('Error fetching farms:', farmsError);

      // Fetch unread alerts count
      const {
        data: alerts,
        error: alertsError
      } = await supabase.from('alerts').select('id').eq('user_id', user!.id).eq('is_read', false);
      if (alertsError) console.error('Error fetching alerts:', alertsError);

      // Fetch average NDVI from recent readings
      let avgNdvi: number | null = null;
      if (farms && farms.length > 0) {
        const farmIds = farms.map(f => f.id);
        const {
          data: readings,
          error: readingsError
        } = await supabase.from('ndvi_readings').select('ndvi_value').in('farm_id', farmIds).order('reading_date', {
          ascending: false
        }).limit(10);
        if (readingsError) {
          console.error('Error fetching NDVI readings:', readingsError);
        } else if (readings && readings.length > 0) {
          const sum = readings.reduce((acc, r) => acc + r.ndvi_value, 0);
          avgNdvi = sum / readings.length;
        }
      }
      setStats({
        farmCount: farms?.length || 0,
        avgNdvi,
        alertCount: alerts?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };
  const refreshNdviReadings = async () => {
    setRefreshingNdvi(true);
    try {
      // Get all user's farms
      const {
        data: farms,
        error: farmsError
      } = await supabase.from('farms').select('id, name').eq('user_id', user!.id);
      if (farmsError) throw farmsError;
      if (!farms || farms.length === 0) {
        toast({
          title: 'No Farms',
          description: 'Add farms first to generate NDVI readings',
          variant: 'destructive'
        });
        return;
      }

      // Generate NDVI for each farm
      let successCount = 0;
      for (const farm of farms) {
        const {
          error
        } = await supabase.functions.invoke('generate-ndvi', {
          body: {
            farm_id: farm.id
          }
        });
        if (!error) successCount++;
      }
      toast({
        title: 'NDVI Refresh Complete',
        description: `Generated new readings for ${successCount} of ${farms.length} farms`
      });

      // Refresh stats
      await fetchStats();
    } catch (error) {
      console.error('Error refreshing NDVI:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh NDVI readings',
        variant: 'destructive'
      });
    } finally {
      setRefreshingNdvi(false);
    }
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  if (!user) {
    return null;
  }
  const features = [{
    title: 'Farm Map',
    description: 'View and manage your farms on an interactive map',
    icon: Map,
    href: '/map',
    color: 'bg-primary'
  }, {
    title: 'AI Advisor',
    description: 'Get personalized crop recommendations',
    icon: MessageSquare,
    href: '/advisor',
    color: 'bg-info'
  }, {
    title: 'Alerts',
    description: 'View smart notifications and alerts',
    icon: Bell,
    href: '/alerts',
    color: 'bg-warning'
  }, {
    title: 'Analytics',
    description: 'Track crop health trends and NDVI data',
    icon: TrendingUp,
    href: '/analytics',
    color: 'bg-success'
  }];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AgroOrbit</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back!
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor your crops and get AI-powered insights
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => navigate('/map')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Map className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.farmCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Farms</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-card-hover transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => navigate('/analytics')}>
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.avgNdvi !== null ? stats.avgNdvi.toFixed(2) : '--'}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg NDVI</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={e => {
                e.stopPropagation();
                refreshNdviReadings();
              }} disabled={refreshingNdvi || stats.farmCount === 0} title="Refresh NDVI readings">
                  <RefreshCw className={`w-4 h-4 ${refreshingNdvi ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => navigate('/alerts')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.alertCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => navigate('/advisor')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">AI</p>
                  <p className="text-sm text-muted-foreground">Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weather Widget */}
        <div className="mb-8">
          <WeatherWidget />
        </div>

        {/* Feature Cards */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(feature => <Card key={feature.title} className="cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => navigate(feature.href)}>
              <CardHeader className="pb-2">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-2`}>
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>)}
        </div>
      </main>
    </div>;
};
export default Dashboard;