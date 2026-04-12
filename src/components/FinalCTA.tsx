import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Try Selthiron for free
        </h2>
        <p className="text-primary-foreground/70 text-lg mb-8">
          Upload your files, get your reconciliation report. No account needed.
        </p>
        <Button variant="secondary" size="xl" asChild>
          <Link to="/access">Start reconciling</Link>
        </Button>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-foreground/60">
          <Shield className="w-4 h-4" />
          <span>We process your data temporarily and delete it immediately after use.</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
