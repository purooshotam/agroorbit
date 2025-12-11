import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, ArrowLeft, Bell, AlertTriangle, AlertCircle, Info, 
  RefreshCw, Check, Trash2, Loader2, CheckCheck 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  farm_id: string | null;
  alert_type: string;
  severity: string | null;
  message: string;
  is_read: boolean | null;
  created_at: string;
  farm?: { name: string } | null;
}

const Alerts = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          farm:farms(name)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load alerts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('analyze-ndvi', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Analysis Complete',
        description: `Analyzed ${data.farms_analyzed} farms, created ${data.alerts_created} new alerts`,
      });

      await fetchAlerts();
    } catch (error) {
      console.error('Error running analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to run NDVI analysis',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => 
        prev.map(a => a.id === alertId ? { ...a, is_read: true } : a)
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      toast({ title: 'All alerts marked as read' });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast({ title: 'Alert deleted' });
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getSeverityIcon = (severity: string | null) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getSeverityBadge = (severity: string | null) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getAlertTypeBadge = (alertType: string) => {
    const typeLabels: Record<string, string> = {
      critical_ndvi: 'Critical NDVI',
      low_ndvi: 'Low NDVI',
      declining_trend: 'Declining Trend',
      health_status: 'Health Status',
      no_data: 'No Data',
    };
    return <Badge variant="outline">{typeLabels[alertType] || alertType}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const unreadCount = alerts.filter(a => !a.is_read).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-warning flex items-center justify-center">
              <Bell className="w-5 h-5 text-warning-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Smart Alerts</h1>
              <p className="text-sm text-muted-foreground">NDVI monitoring & notifications</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
            <Button onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Run Analysis
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{alerts.length}</p>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-warning">{unreadCount}</p>
              <p className="text-sm text-muted-foreground">Unread</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-destructive">{criticalCount}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Alerts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Run an analysis to check your farms for potential issues
              </p>
              <Button onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Analyze NDVI Readings
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`transition-all ${!alert.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getSeverityBadge(alert.severity)}
                        {getAlertTypeBadge(alert.alert_type)}
                        {alert.farm && (
                          <Badge variant="outline" className="bg-background">
                            <Leaf className="w-3 h-3 mr-1" />
                            {alert.farm.name}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-foreground mb-2">{alert.message}</p>
                      
                      <p className="text-xs text-muted-foreground">
                        {formatDate(alert.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {!alert.is_read && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => markAsRead(alert.id)}
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteAlert(alert.id)}
                        title="Delete"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Alerts;
