import { MapPin, Satellite, BarChart3, Lightbulb } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: MapPin,
    title: "Select Your Farm",
    description: "Draw your farm boundaries on our interactive map. We'll save your fields for continuous monitoring.",
  },
  {
    step: 2,
    icon: Satellite,
    title: "Satellite Fetches Data",
    description: "Our system automatically retrieves the latest satellite imagery for your selected area every few days.",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "NDVI is Calculated",
    description: "Advanced algorithms analyze the imagery to calculate vegetation and moisture indices for each field.",
  },
  {
    step: 4,
    icon: Lightbulb,
    title: "Get Insights",
    description: "View your crop health dashboard and receive smart recommendations for irrigation and care.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative bg-secondary/30">
      <div className="container-custom section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-semibold mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Simple Steps to{" "}
            <span className="text-gradient">Smarter Farming</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Getting started with satellite crop monitoring is easier than you think. Here's how it works.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((item, index) => (
              <div key={item.step} className="relative text-center group">
                {/* Step Number Circle */}
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-card rounded-2xl shadow-card flex items-center justify-center mx-auto group-hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1">
                    <item.icon className="w-9 h-9 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
