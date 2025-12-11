import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DailyForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  weather_code: number;
  weather_description: string;
  precipitation_sum: number;
}

interface WeatherData {
  farm_id: string;
  farm_name: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
  weather_code: number;
  weather_description: string;
  forecast: DailyForecast[];
}

const getWeatherIcon = (code: number, size = 8) => {
  const className = `w-${size} h-${size}`;
  if (code === 0 || code === 1) return <Sun className={`${className} text-warning`} />;
  if (code >= 2 && code <= 3) return <Cloud className={`${className} text-muted-foreground`} />;
  if (code >= 51 && code <= 82) return <CloudRain className={`${className} text-info`} />;
  if (code >= 71 && code <= 86) return <CloudSnow className={`${className} text-blue-300`} />;
  if (code >= 95) return <CloudRain className={`${className} text-destructive`} />;
  return <Cloud className={`${className} text-muted-foreground`} />;
};

const getSmallWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="w-5 h-5 text-warning" />;
  if (code >= 2 && code <= 3) return <Cloud className="w-5 h-5 text-muted-foreground" />;
  if (code >= 51 && code <= 82) return <CloudRain className="w-5 h-5 text-info" />;
  if (code >= 71 && code <= 86) return <CloudSnow className="w-5 h-5 text-blue-300" />;
  if (code >= 95) return <CloudRain className="w-5 h-5 text-destructive" />;
  return <Cloud className="w-5 h-5 text-muted-foreground" />;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const FarmWeatherCard = ({ weather }: { weather: WeatherData }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-4 p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            {getWeatherIcon(weather.weather_code)}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{weather.farm_name}</p>
              <p className="text-sm text-muted-foreground">{weather.weather_description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1" title="Temperature">
                <Thermometer className="w-4 h-4 text-destructive" />
                <span className="font-medium">{weather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-1 hidden sm:flex" title="Humidity">
                <Droplets className="w-4 h-4 text-info" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1 hidden md:flex" title="Wind">
                <Wind className="w-4 h-4 text-muted-foreground" />
                <span>{weather.wind_speed} km/h</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 border-t border-border bg-background">
            <p className="text-sm font-medium text-muted-foreground mb-3">7-Day Forecast</p>
            <div className="grid grid-cols-7 gap-2">
              {weather.forecast.map((day, index) => (
                <div 
                  key={day.date} 
                  className={`flex flex-col items-center p-2 rounded-lg ${index === 0 ? 'bg-primary/10' : 'bg-muted/30'}`}
                >
                  <span className="text-xs font-medium text-muted-foreground mb-1">
                    {formatDate(day.date)}
                  </span>
                  {getSmallWeatherIcon(day.weather_code)}
                  <div className="mt-1 text-center">
                    <span className="text-sm font-medium">{Math.round(day.temp_max)}°</span>
                    <span className="text-xs text-muted-foreground"> / {Math.round(day.temp_min)}°</span>
                  </div>
                  {day.precipitation_sum > 0 && (
                    <div className="flex items-center gap-0.5 mt-1">
                      <Droplets className="w-3 h-3 text-info" />
                      <span className="text-xs text-info">{day.precipitation_sum}mm</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
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
        <p className="text-sm text-muted-foreground">Click on a farm to view 7-day forecast</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {weather.map((w) => (
            <FarmWeatherCard key={w.farm_id} weather={w} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
