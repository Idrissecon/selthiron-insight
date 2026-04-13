import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Download, Shield, X } from "lucide-react";
import logo from "@/assets/selthiron-logo.png";
import type { ReconciliationReport, MatchResult } from "@/lib/reconciliation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const report = location.state?.report as ReconciliationReport | undefined;
  const [showLoginModal, setShowLoginModal] = useState(false);

  const statusConfig = {
    matched: { icon: CheckCircle2, label: t('status.matched'), className: "text-success", bg: "bg-success/10" },
    unmatched: { icon: XCircle, label: t('status.unmatched'), className: "text-destructive", bg: "bg-destructive/10" },
    discrepancy: { icon: AlertTriangle, label: t('status.discrepancy'), className: "text-warning", bg: "bg-warning/10" },
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  if (!report) return <Navigate to="/tool" replace />;

  const exportCSV = () => {
    const header = "Date,Description,Amount,Status,Provider Date,Provider Desc,Provider Amount,Difference\n";
    const rows = report.results.map((r) => {
      const b = r.bankTx;
      const p = r.providerTx;
      
      if (!b && p) {
        // Unmatched provider transaction
        return [
          "", "Provider only", "", r.status,
          p.date, `"${p.description}"`, p.amount,
          "",
        ].join(",");
      }
      
      return [
        b?.date || "", b ? `"${b.description}"` : "", b?.amount || 0, r.status,
        p?.date || "", p ? `"${p.description}"` : "", p?.amount || "",
        r.amountDiff?.toFixed(2) || "",
      ].join(",");
    });
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selthiron-reconciliation.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto flex items-center justify-between h-14 px-6">
          <button onClick={() => navigate(isAuthenticated ? "/tool" : "/")} className="cursor-pointer hover:opacity-80 transition-opacity">
            <img src={logo} alt="Selthiron" className="h-20 bg-transparent" />
          </button>
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 absolute top-4 right-4"
                  onClick={() => setShowLoginModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/access", { state: { report } })}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t('common.signIn')}
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/tool")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('results.newReconciliation')}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{t('results.title')}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" />
            {t('results.downloadCSV')}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <SummaryCard
            label={t('results.matchRate')}
            value={`${report.matchRate?.toFixed(0) || 0}%`}
            className="text-success"
          />
          <SummaryCard label={t('results.matched')} value={report.matched || 0} className="text-success" />
          <SummaryCard label={t('results.unmatched')} value={report.unmatched || 0} className="text-destructive" />
          <SummaryCard label={t('results.discrepancies')} value={report.discrepancies || 0} className="text-warning" />
        </div>

        {/* Results Table */}
        <div className="bg-surface-elevated border rounded-xl overflow-hidden shadow-sm">
          <div className="hidden md:grid grid-cols-[100px_1fr_110px_110px_100px] gap-4 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b bg-surface">
            <span>{t('table.date')}</span>
            <span>{t('table.description')}</span>
            <span className="text-right">{t('table.amount')}</span>
            <span className="text-right">{t('table.provider')}</span>
            <span className="text-right">{t('table.status')}</span>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {report.results.map((r, i) => (
              <ResultRow key={i} result={r} statusConfig={statusConfig} t={t} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          {isAuthenticated ? (
            <p className="text-xs text-muted-foreground">{t('results.reconciliationSaved')}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{t('results.signInToSaveDesc')}</p>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && !isAuthenticated && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold mb-4">{t('results.summary')}</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{t('hero.subtitle')}</p>
            <Button
              className="w-full"
              onClick={() => navigate("/access", { state: { report } })}
            >
              <Shield className="w-4 h-4 mr-2" />
              {t('results.signInToSave')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div className="bg-surface-elevated border rounded-lg p-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`text-2xl font-metric ${className || ""}`}>{value}</p>
  </div>
);

const ResultRow = ({ result, statusConfig, t }: { result: MatchResult; statusConfig: any; t: any }) => {
  const config = statusConfig[result.status];
  const Icon = config.icon;

  // Handle unmatched provider transactions (bankTx is null)
  if (!result.bankTx && result.providerTx) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_110px_110px_100px] gap-2 md:gap-4 px-6 py-4 text-sm hover:bg-surface transition-colors bg-destructive/5">
        <span className="text-muted-foreground">—</span>
        <span className="font-medium truncate text-muted-foreground italic">{t('results.providerOnly')}</span>
        <span className="text-right font-mono text-muted-foreground">—</span>
        <span className="text-right font-mono text-destructive">${Math.abs(result.providerTx.amount).toFixed(2)}</span>
        <span className={`flex items-center md:justify-end gap-1.5 ${config.className}`}>
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium">{config.label}</span>
        </span>
      </div>
    );
  }

  // Handle normal case (bankTx exists)
  const bankTx = result.bankTx!;
  return (
    <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_110px_110px_100px] gap-2 md:gap-4 px-6 py-4 text-sm hover:bg-surface transition-colors">
      <span className="text-muted-foreground">{bankTx.date}</span>
      <span className="font-medium truncate">{bankTx.description}</span>
      <span className="text-right font-mono">${Math.abs(bankTx.amount).toFixed(2)}</span>
      <span className="text-right font-mono text-muted-foreground">
        {result.providerTx ? `$${Math.abs(result.providerTx.amount).toFixed(2)}` : "—"}
      </span>
      <span className={`flex items-center md:justify-end gap-1.5 ${config.className}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{config.label}</span>
      </span>
    </div>
  );
};

export default Results;
