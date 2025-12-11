import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

// Map WMO weather codes to descriptions
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return weatherCodes[code] || "Unknown";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    console.log(`Fetching weather for user: ${user.id}`);

    // Get user's farms
    const { data: farms, error: farmsError } = await supabase
      .from("farms")
      .select("id, name, location_lat, location_lng")
      .eq("user_id", user.id);

    if (farmsError) {
      throw new Error(`Failed to fetch farms: ${farmsError.message}`);
    }

    if (!farms || farms.length === 0) {
      return new Response(
        JSON.stringify({ weather: [], message: "No farms found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const weatherData: WeatherData[] = [];

    // Fetch weather for each farm
    for (const farm of farms) {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${farm.location_lat}&longitude=${farm.location_lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=auto&forecast_days=7`;
        
        console.log(`Fetching weather for ${farm.name}`);
        
        const response = await fetch(weatherUrl);
        if (!response.ok) {
          console.error(`Weather API error for ${farm.name}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const current = data.current;
        const daily = data.daily;

        // Build forecast array
        const forecast: DailyForecast[] = [];
        for (let i = 0; i < daily.time.length; i++) {
          forecast.push({
            date: daily.time[i],
            temp_max: daily.temperature_2m_max[i],
            temp_min: daily.temperature_2m_min[i],
            weather_code: daily.weather_code[i],
            weather_description: getWeatherDescription(daily.weather_code[i]),
            precipitation_sum: daily.precipitation_sum[i],
          });
        }

        weatherData.push({
          farm_id: farm.id,
          farm_name: farm.name,
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          precipitation: current.precipitation,
          wind_speed: current.wind_speed_10m,
          weather_code: current.weather_code,
          weather_description: getWeatherDescription(current.weather_code),
          forecast,
        });

        console.log(`Weather for ${farm.name}: ${current.temperature_2m}°C, 7-day forecast loaded`);
      } catch (error) {
        console.error(`Error fetching weather for ${farm.name}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        weather: weatherData,
        fetched_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-weather function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
