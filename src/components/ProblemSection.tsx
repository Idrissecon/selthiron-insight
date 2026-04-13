import { Clock, AlertTriangle, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProblemSection = () => {
  const { t } = useTranslation();

  const problems = [
    {
      icon: Clock,
      title: t('problem.problem1.title'),
      description: t('problem.problem1.description'),
    },
    {
      icon: AlertTriangle,
      title: t('problem.problem2.title'),
      description: t('problem.problem2.description'),
    },
    {
      icon: Search,
      title: t('problem.problem3.title'),
      description: t('problem.problem3.description'),
    },
  ];

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
