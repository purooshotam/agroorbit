import { ShieldCheck, Droplets, TrendingUp, Sprout, Clock, BadgeCheck } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Early Stress Detection",
    description: "Catch crop diseases and pest infestations before they spread across your fields.",
  },
  {
    icon: Droplets,
    title: "Reduced Water Usage",
    description: "Irrigate only when and where needed based on actual moisture data from satellites.",
  },
  {
    icon: TrendingUp,
    title: "Higher Yield Accuracy",
    description: "Predict harvest outcomes more accurately with continuous crop health monitoring.",
  },
  {
    icon: Sprout,
    title: "Works for All Crops",
    description: "Whether you grow wheat, corn, cotton, or vegetables—our system adapts to your needs.",
  },
  {
    icon: Clock,
    title: "Save Time & Labor",
    description: "No more walking fields to check crops. Monitor everything from your phone or computer.",
  },
  {
    icon: BadgeCheck,
    title: "Data-Driven Decisions",
    description: "Replace guesswork with scientific insights backed by real satellite data.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container-custom section-padding relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-semibold mb-3">Benefits</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Why Farmers{" "}
            <span className="text-gradient">Choose Agro Orbit</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of farmers who are already saving money and increasing yields with satellite monitoring.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group flex items-start gap-4 p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
