import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simulate NDVI value based on crop type and random factors
function generateNDVIValue(cropType: string | null): number {
  // Base NDVI ranges for different crop types
  const cropRanges: Record<string, { min: number; max: number }> = {
    Wheat: { min: 0.45, max: 0.85 },
    Corn: { min: 0.50, max: 0.90 },
    Rice: { min: 0.40, max: 0.80 },
    Soybeans: { min: 0.45, max: 0.85 },
    Cotton: { min: 0.35, max: 0.75 },
    Barley: { min: 0.40, max: 0.80 },
    Oats: { min: 0.40, max: 0.80 },
    Sugarcane: { min: 0.50, max: 0.90 },
    Vegetables: { min: 0.35, max: 0.75 },
    Fruits: { min: 0.45, max: 0.85 },
    Other: { min: 0.30, max: 0.80 },
  };

  const range = cropRanges[cropType || "Other"] || cropRanges.Other;
  const ndvi = range.min + Math.random() * (range.max - range.min);
  return Math.round(ndvi * 100) / 100;
}

// Determine health status based on NDVI value
function getHealthStatus(ndvi: number): string {
  if (ndvi >= 0.7) return "Excellent";
  if (ndvi >= 0.5) return "Good";
  if (ndvi >= 0.3) return "Moderate";
  if (ndvi >= 0.2) return "Poor";
  return "Critical";
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

    const { farm_id } = await req.json();
    
    if (!farm_id) {
      throw new Error("farm_id is required");
    }

    console.log(`Generating NDVI reading for farm: ${farm_id}, user: ${user.id}`);

    // Get farm details
    const { data: farm, error: farmError } = await supabase
      .from("farms")
      .select("id, name, crop_type, user_id")
      .eq("id", farm_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (farmError) {
      throw new Error(`Failed to fetch farm: ${farmError.message}`);
    }

    if (!farm) {
      throw new Error("Farm not found or access denied");
    }

    // Generate NDVI reading
    const ndviValue = generateNDVIValue(farm.crop_type);
    const healthStatus = getHealthStatus(ndviValue);

    console.log(`Generated NDVI: ${ndviValue}, Health: ${healthStatus} for ${farm.name}`);

    // Insert the NDVI reading
    const { data: reading, error: insertError } = await supabase
      .from("ndvi_readings")
      .insert({
        farm_id: farm.id,
        ndvi_value: ndviValue,
        health_status: healthStatus,
        satellite_source: "Sentinel-2 (Simulated)",
        reading_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to insert NDVI reading: ${insertError.message}`);
    }

    console.log(`NDVI reading created successfully: ${reading.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `NDVI analysis complete for ${farm.name}`,
        reading: {
          id: reading.id,
          ndvi_value: ndviValue,
          health_status: healthStatus,
          farm_name: farm.name,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-ndvi function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
