import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Satellite, Activity, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-farm-ndvi.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleWatchDemo = () => {
    setIsVideoOpen(true);
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container-custom section-padding relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium animate-fade-in">
                <Satellite className="w-4 h-4" />
                Powered by Satellite Technology
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-in-up">
                Monitor Your Crops with{" "}
                <span className="text-gradient">Satellite Data</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Detect crop stress, water needs, and growth patterns early using advanced NDVI and moisture index analysis. Make smarter farming decisions with real-time satellite insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <Button variant="hero" size="xl" onClick={handleGetStarted}>
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="hero-outline" size="xl" onClick={handleWatchDemo}>
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Farms Monitored</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">95%</p>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">30%</p>
                  <p className="text-sm text-muted-foreground">Water Saved</p>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-2xl overflow-hidden shadow-card-hover">
                <img src={heroImage} alt="NDVI satellite map showing crop health visualization with green healthy areas and red stressed zones" className="w-full h-auto object-cover" />
                {/* Floating Card */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto glass rounded-xl p-4 shadow-card animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Crop Health: Good</p>
                      <p className="text-xs text-muted-foreground">NDVI: 0.78 • Updated 2h ago</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-background">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-semibold">Watch How It Works</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dVrPaw7TpMw?autoplay=0"
              title="AgriSense Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeroSection;
