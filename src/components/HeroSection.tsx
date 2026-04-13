import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="pt-32 pb-20 md:pt-44 md:pb-32">
      <div className="container mx-auto px-6 text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight animate-fade-up">
          {t('heroTitle')}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up [animation-delay:100ms] opacity-0">
          {t('heroSubtitle')}
        </p>
        <div className="mt-10 animate-fade-up [animation-delay:200ms] opacity-0">
          <Button variant="hero" size="xl" asChild>
            <Link to="/tool">{t('heroCTA')}</Link>
          </Button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-up [animation-delay:300ms] opacity-0">
          <Shield className="w-4 h-4" />
          <span>{t('heroPrivacy')}</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
