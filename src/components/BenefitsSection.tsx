import { Zap, ShieldCheck, Eye, Settings } from "lucide-react";

const benefits = [
  { icon: Zap, title: "Save hours", description: "What used to take half a day now takes minutes." },
  { icon: ShieldCheck, title: "Reduce errors", description: "Automated matching eliminates human mistakes." },
  { icon: Eye, title: "Instant clarity", description: "See exactly which transactions match and which don't." },
  { icon: Settings, title: "No setup", description: "No integrations, no onboarding. Just upload and go." },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16">
          Why Selthiron
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {benefits.map((b) => (
            <div key={b.title} className="text-center">
              <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
                <b.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold font-sans mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
