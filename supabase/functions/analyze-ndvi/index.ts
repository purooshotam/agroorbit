import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NDVIReading {
  id: string;
  farm_id: string;
  ndvi_value: number;
  health_status: string;
  reading_date: string;
  farm_name?: string;
}

interface Alert {
  user_id: string;
  farm_id: string;
  alert_type: string;
  severity: string;
  message: string;
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

    console.log(`Analyzing NDVI readings for user: ${user.id}`);

    // Get user's farms
    const { data: farms, error: farmsError } = await supabase
      .from("farms")
      .select("id, name")
      .eq("user_id", user.id);

    if (farmsError) {
      throw new Error(`Failed to fetch farms: ${farmsError.message}`);
    }

    if (!farms || farms.length === 0) {
      return new Response(
        JSON.stringify({ message: "No farms found", alerts_created: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const farmIds = farms.map(f => f.id);
    const farmMap = new Map(farms.map(f => [f.id, f.name]));

    // Get recent NDVI readings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: readings, error: readingsError } = await supabase
      .from("ndvi_readings")
      .select("*")
      .in("farm_id", farmIds)
      .gte("reading_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("reading_date", { ascending: false });

    if (readingsError) {
      throw new Error(`Failed to fetch readings: ${readingsError.message}`);
    }

    console.log(`Found ${readings?.length || 0} readings to analyze`);

    const alertsToCreate: Alert[] = [];

    // Group readings by farm
    const readingsByFarm = new Map<string, NDVIReading[]>();
    for (const reading of readings || []) {
      const farmReadings = readingsByFarm.get(reading.farm_id) || [];
      farmReadings.push({ ...reading, farm_name: farmMap.get(reading.farm_id) });
      readingsByFarm.set(reading.farm_id, farmReadings);
    }

    // Analyze each farm's readings
    for (const [farmId, farmReadings] of readingsByFarm) {
      const farmName = farmMap.get(farmId) || "Unknown Farm";
      const latestReading = farmReadings[0];

      // Alert 1: Critical NDVI (below 0.2)
      if (latestReading.ndvi_value < 0.2) {
        alertsToCreate.push({
          user_id: user.id,
          farm_id: farmId,
          alert_type: "critical_ndvi",
          severity: "critical",
          message: `Critical alert: ${farmName} has very low NDVI (${latestReading.ndvi_value.toFixed(2)}). Immediate inspection recommended for potential crop failure or severe stress.`,
        });
      }
      // Alert 2: Low NDVI warning (0.2 - 0.4)
      else if (latestReading.ndvi_value < 0.4) {
        alertsToCreate.push({
          user_id: user.id,
          farm_id: farmId,
          alert_type: "low_ndvi",
          severity: "warning",
          message: `Warning: ${farmName} shows low NDVI (${latestReading.ndvi_value.toFixed(2)}). Consider checking irrigation, nutrient levels, or pest presence.`,
        });
      }

      // Alert 3: Declining trend (if we have multiple readings)
      if (farmReadings.length >= 2) {
        const previousReadings = farmReadings.slice(1, 4); // Get 2-3 previous readings
        const avgPrevious = previousReadings.reduce((sum, r) => sum + r.ndvi_value, 0) / previousReadings.length;
        const decline = avgPrevious - latestReading.ndvi_value;
        
        if (decline > 0.15) {
          alertsToCreate.push({
            user_id: user.id,
            farm_id: farmId,
            alert_type: "declining_trend",
            severity: "warning",
            message: `Trend alert: ${farmName} shows significant NDVI decline (${(decline * 100).toFixed(1)}% drop). Monitor closely for developing issues.`,
          });
        }
      }

      // Alert 4: Health status based alerts
      if (latestReading.health_status === "Poor" || latestReading.health_status === "Critical") {
        alertsToCreate.push({
          user_id: user.id,
          farm_id: farmId,
          alert_type: "health_status",
          severity: latestReading.health_status === "Critical" ? "critical" : "warning",
          message: `Health alert: ${farmName} is classified as "${latestReading.health_status}". Review satellite imagery and consider field inspection.`,
        });
      }
    }

    // Check for farms without recent readings
    for (const farm of farms) {
      const hasRecentReading = readingsByFarm.has(farm.id);
      if (!hasRecentReading) {
        alertsToCreate.push({
          user_id: user.id,
          farm_id: farm.id,
          alert_type: "no_data",
          severity: "info",
          message: `Info: ${farm.name} has no NDVI readings in the last 7 days. Consider scheduling a satellite capture or manual inspection.`,
        });
      }
    }

    // Insert new alerts (avoid duplicates by checking existing alerts from today)
    const today = new Date().toISOString().split("T")[0];
    const { data: existingAlerts } = await supabase
      .from("alerts")
      .select("farm_id, alert_type")
      .eq("user_id", user.id)
      .gte("created_at", today);

    const existingAlertKeys = new Set(
      (existingAlerts || []).map(a => `${a.farm_id}-${a.alert_type}`)
    );

    const newAlerts = alertsToCreate.filter(
      a => !existingAlertKeys.has(`${a.farm_id}-${a.alert_type}`)
    );

    let alertsCreated = 0;
    if (newAlerts.length > 0) {
      const { error: insertError } = await supabase
        .from("alerts")
        .insert(newAlerts);

      if (insertError) {
        console.error("Failed to insert alerts:", insertError);
      } else {
        alertsCreated = newAlerts.length;
        console.log(`Created ${alertsCreated} new alerts`);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Analysis complete",
        farms_analyzed: farms.length,
        readings_processed: readings?.length || 0,
        alerts_created: alertsCreated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-ndvi function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
