import { Activity, AlertTriangle, CheckCircle, Droplets, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-farm-ndvi.jpg";

const DashboardPreview = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container-custom section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-semibold mb-3">Dashboard Preview</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Your Farm at a Glance
          </h2>
          <p className="text-lg text-muted-foreground">
            Our intuitive dashboard puts all your crop insights in one place. Simple, clear, and actionable.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="bg-card rounded-3xl shadow-card-hover p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main NDVI Map */}
            <div className="lg:col-span-2 bg-secondary/50 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">NDVI Map - North Field</h3>
                <p className="text-sm text-muted-foreground">Last updated: 2 hours ago</p>
              </div>
              <div className="relative aspect-video">
                <img
                  src={heroImage}
                  alt="NDVI vegetation map showing crop health"
                  className="w-full h-full object-cover"
                />
                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-xs">
                  <p className="font-semibold mb-2 text-foreground">Health Index</p>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-3 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                  </div>
                  <div className="flex justify-between mt-1 text-muted-foreground">
                    <span>Poor</span>
                    <span>Good</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Cards */}
            <div className="space-y-6">
              {/* Crop Health Card */}
              <div className="bg-secondary/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Crop Health</h3>
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Status</span>
                    <span className="text-sm font-semibold text-success flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Good
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-gradient-to-r from-primary to-accent rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>NDVI: 0.78</span>
                    <span>Target: 0.80</span>
                  </div>
                </div>
              </div>

              {/* Water Status Card */}
              <div className="bg-secondary/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Water Index</h3>
                  <Droplets className="w-5 h-5 text-info" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Moisture Level</span>
                    <span className="text-sm font-semibold text-info">Adequate</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-info rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">NDWI: 0.42 • Next irrigation: 3 days</p>
                </div>
              </div>

              {/* Alerts Card */}
              <div className="bg-secondary/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Active Alerts</h3>
                  <span className="text-xs bg-warning/20 text-warning-foreground px-2 py-1 rounded-full font-medium">2 New</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Stress Detected</p>
                      <p className="text-xs text-muted-foreground">East section needs attention</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Growth Update</p>
                      <p className="text-xs text-muted-foreground">Crop health improved 5%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
