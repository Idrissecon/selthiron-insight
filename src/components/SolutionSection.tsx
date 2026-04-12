import { Upload, GitCompareArrows, ClipboardCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload",
    description: "Drop your bank CSV and payment provider CSV into Selthiron.",
  },
  {
    icon: GitCompareArrows,
    step: "02",
    title: "Match",
    description: "Our engine normalizes and cross-references every transaction automatically.",
  },
  {
    icon: ClipboardCheck,
    step: "03",
    title: "Review",
    description: "See matched, unmatched, and flagged transactions in a clear report.",
  },
];

const SolutionSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
          How it works
        </h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-16">
          Three steps. No setup. No account required.
        </p>
        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Step {step.step}
              </span>
              <h3 className="text-xl font-semibold font-sans mt-2 mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
