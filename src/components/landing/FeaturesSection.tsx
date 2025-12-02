import { Satellite, Waves, Map, Lightbulb } from "lucide-react";

const features = [
  {
    icon: Satellite,
    title: "Satellite-Based Crop Health",
    description: "Access high-resolution satellite imagery to monitor your entire farm from above. Track vegetation health across all your fields in real-time.",
  },
  {
    icon: Waves,
    title: "NDVI & Moisture Analysis",
    description: "Get detailed NDVI (vegetation index) and NDWI (water index) maps that show exactly where your crops need attention.",
  },
  {
    icon: Map,
    title: "Farm Boundary Mapping",
    description: "Easily draw and save your farm boundaries. Our system remembers your fields and tracks changes over multiple growing seasons.",
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description: "Receive actionable alerts for irrigation timing, fertilizer application, and crop stress management based on satellite analysis.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative bg-secondary/30">
      <div className="container-custom section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-semibold mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="text-gradient">Grow Smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our satellite-powered platform gives you the tools to monitor, analyze, and optimize your farm like never before.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-6 lg:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
