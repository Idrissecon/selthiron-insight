import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProductPreview = () => {
  const { t } = useTranslation();

  const mockData = [
    { date: "2025-03-01", desc: "Payment #4821", amount: "$1,250.00", status: "matched" },
    { date: "2025-03-02", desc: "Subscription renewal", amount: "$49.99", status: "matched" },
    { date: "2025-03-03", desc: "Refund #892", amount: "-$75.00", status: "discrepancy" },
    { date: "2025-03-04", desc: "Invoice #1093", amount: "$3,400.00", status: "unmatched" },
    { date: "2025-03-05", desc: "Payment #4822", amount: "$890.00", status: "matched" },
  ];

  const statusConfig = {
    matched: { icon: CheckCircle2, label: t('matchedLabel'), className: "text-success" },
    unmatched: { icon: XCircle, label: t('unmatchedLabel'), className: "text-destructive" },
    discrepancy: { icon: AlertTriangle, label: t('discrepancyLabel'), className: "text-warning" },
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
          See it in action
        </h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          A clear, instant overview of your reconciliation results.
        </p>
        <div className="max-w-3xl mx-auto bg-surface-elevated border rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b bg-surface">
            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">3 {t('matchedLabel')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-md">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium">1 {t('unmatchedLabel')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">1 {t('discrepancyLabel')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="divide-y">
            <div className="grid grid-cols-[100px_1fr_120px_120px] gap-4 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>{t('date')}</span>
              <span>{t('description')}</span>
              <span className="text-right">{t('amount')}</span>
              <span className="text-right">{t('status')}</span>
            </div>
            {mockData.map((row, i) => {
              const config = statusConfig[row.status as keyof typeof statusConfig];
              const Icon = config.icon;
              return (
                <div
                  key={i}
                  className="grid grid-cols-[100px_1fr_120px_120px] gap-4 px-6 py-4 text-sm hover:bg-surface transition-colors"
                >
                  <span className="text-muted-foreground">{row.date}</span>
                  <span className="font-medium">{row.desc}</span>
                  <span className="text-right font-mono">{row.amount}</span>
                  <span className={`text-right flex items-center justify-end gap-1.5 ${config.className}`}>
                    <Icon className="w-4 h-4" />
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPreview;
