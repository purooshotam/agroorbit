import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden">
      <div className="container-custom section-padding">
        <div className="relative bg-primary rounded-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Leaf className="w-96 h-96 text-primary-foreground/5" />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center py-16 px-6 sm:py-20 sm:px-12 lg:py-24 lg:px-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 max-w-3xl mx-auto">
              Start Monitoring Your Farm Today
            </h2>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join thousands of farmers using satellite technology to grow healthier crops, save water, and increase yields.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:scale-105 transition-all"
                onClick={() => navigate('/auth')}
              >
                Sign Up Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/auth')}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
