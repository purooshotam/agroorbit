import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, ArrowLeft, Loader2, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

type Farm = {
  id: string;
  name: string;
};

type NdviReading = {
  id: string;
  farm_id: string;
  ndvi_value: number;
  health_status: string;
  reading_date: string;
  satellite_source: string | null;
};

const HEALTH_COLORS: Record<string, string> = {
  excellent: 'hsl(142, 76%, 36%)',
  good: 'hsl(142, 71%, 45%)',
  moderate: 'hsl(48, 96%, 53%)',
  poor: 'hsl(25, 95%, 53%)',
  critical: 'hsl(0, 84%, 60%)',
};

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [readings, setReadings] = useState<NdviReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('30');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFarms();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReadings();
    }
  }, [user, selectedFarm, timeRange]);

  const fetchFarms = async () => {
    const { data, error } = await supabase
      .from('farms')
      .select('id, name')
      .order('name');
    
    if (!error && data) {
      setFarms(data);
    }
  };

  const fetchReadings = async () => {
    setLoading(true);
    const startDate = format(subDays(new Date(), parseInt(timeRange)), 'yyyy-MM-dd');
    
    let query = supabase
      .from('ndvi_readings')
      .select('*')
      .gte('reading_date', startDate)
      .order('reading_date', { ascending: true });

    if (selectedFarm !== 'all') {
      query = query.eq('farm_id', selectedFarm);
    }

    const { data, error } = await query;
    
    if (!error && data) {
      setReadings(data);
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Process data for charts
  const trendData = readings.reduce((acc: any[], reading) => {
    const date = reading.reading_date;
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.values.push(reading.ndvi_value);
      existing.ndvi = existing.values.reduce((a: number, b: number) => a + b, 0) / existing.values.length;
    } else {
      acc.push({
        date,
        ndvi: reading.ndvi_value,
        values: [reading.ndvi_value],
        displayDate: format(parseISO(date), 'MMM d'),
      });
    }
    return acc;
  }, []);

  const healthDistribution = readings.reduce((acc: Record<string, number>, reading) => {
    acc[reading.health_status] = (acc[reading.health_status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(healthDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: HEALTH_COLORS[name] || 'hsl(var(--muted))',
  }));

  // Calculate stats
  const avgNdvi = readings.length > 0 
    ? (readings.reduce((sum, r) => sum + r.ndvi_value, 0) / readings.length).toFixed(2)
    : '--';
  
  const latestNdvi = readings.length > 0 ? readings[readings.length - 1]?.ndvi_value.toFixed(2) : '--';
  const previousNdvi = readings.length > 1 ? readings[readings.length - 2]?.ndvi_value : null;
  const trend = previousNdvi && readings.length > 0 
    ? ((readings[readings.length - 1].ndvi_value - previousNdvi) / previousNdvi * 100).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">NDVI Analytics</span>
          </div>

          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedFarm} onValueChange={setSelectedFarm}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select farm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farms</SelectItem>
                {farms.map(farm => (
                  <SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average NDVI</p>
                  <p className="text-3xl font-bold text-foreground">{avgNdvi}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Latest Reading</p>
                  <p className="text-3xl font-bold text-foreground">{latestNdvi}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trend</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-foreground">
                      {trend ? `${parseFloat(trend) > 0 ? '+' : ''}${trend}%` : '--'}
                    </p>
                    {trend && (
                      parseFloat(trend) > 0 
                        ? <TrendingUp className="w-5 h-5 text-success" />
                        : <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : readings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No NDVI Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              NDVI readings will appear here once your farms have satellite data.
            </p>
            <Link to="/map">
              <Button>Add a Farm</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NDVI Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>NDVI Trend Over Time</CardTitle>
                <CardDescription>
                  Vegetation health index values (0-1 scale, higher is healthier)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        domain={[0, 1]} 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ndvi"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#ndviGradient)"
                        name="NDVI Value"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Health Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Health Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of crop health categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* NDVI Bar Chart by Reading */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Readings</CardTitle>
                <CardDescription>
                  Individual NDVI measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        domain={[0, 1]} 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar 
                        dataKey="ndvi" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                        name="NDVI Value"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;
