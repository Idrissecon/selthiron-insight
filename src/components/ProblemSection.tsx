import { Clock, AlertTriangle, Search } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Manual reconciliation is slow",
    description: "Hours spent cross-referencing bank statements with payment provider exports, line by line.",
  },
  {
    icon: AlertTriangle,
    title: "Spreadsheets cause errors",
    description: "Copy-paste mistakes, wrong formulas, and missed transactions lead to costly discrepancies.",
  },
  {
    icon: Search,
    title: "Hard to track mismatches",
    description: "Finding which transactions don't match across systems is like searching for a needle in a haystack.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
          The reconciliation problem
        </h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-16">
          Small businesses lose time and money every month to manual financial reconciliation.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="bg-surface-elevated rounded-lg p-8 border shadow-sm"
            >
              <problem.icon className="w-8 h-8 text-destructive mb-4" />
              <h3 className="text-lg font-semibold font-sans mb-2">{problem.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
