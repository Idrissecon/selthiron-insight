import { Zap, ShieldCheck, Eye, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

const BenefitsSection = () => {
  const { t } = useTranslation();

  const benefits = [
    { icon: Zap, title: t('benefits.benefit1.title'), description: t('benefits.benefit1.description') },
    { icon: ShieldCheck, title: t('benefits.benefit2.title'), description: t('benefits.benefit2.description') },
    { icon: Eye, title: t('benefits.benefit3.title'), description: t('benefits.benefit3.description') },
    { icon: Settings, title: t('benefits.benefit4.title'), description: t('benefits.benefit4.description') },
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16">
          {t('benefits.header')}
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
