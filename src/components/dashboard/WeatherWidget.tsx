import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, RefreshCw, Loader2 } from 'lucide-react';

interface WeatherData {
  farm_id: string;
  farm_name: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
  weather_code: number;
  weather_description: string;
}

const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="w-8 h-8 text-warning" />;
  if (code >= 2 && code <= 3) return <Cloud className="w-8 h-8 text-muted-foreground" />;
  if (code >= 51 && code <= 82) return <CloudRain className="w-8 h-8 text-info" />;
  return <Cloud className="w-8 h-8 text-muted-foreground" />;
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('get-weather');
      
      if (error) throw error;
      
      setWeather(data.weather || []);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-4">
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchWeather} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (weather.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-4">
          <p className="text-muted-foreground text-sm">Add farms to see weather data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Conditions
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchWeather}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weather.map((w) => (
            <div key={w.farm_id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              {getWeatherIcon(w.weather_code)}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{w.farm_name}</p>
                <p className="text-sm text-muted-foreground">{w.weather_description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1" title="Temperature">
                  <Thermometer className="w-4 h-4 text-destructive" />
                  <span className="font-medium">{w.temperature}°C</span>
                </div>
                <div className="flex items-center gap-1 hidden sm:flex" title="Humidity">
                  <Droplets className="w-4 h-4 text-info" />
                  <span>{w.humidity}%</span>
                </div>
                <div className="flex items-center gap-1 hidden md:flex" title="Wind">
                  <Wind className="w-4 h-4 text-muted-foreground" />
                  <span>{w.wind_speed} km/h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
