import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Download, Shield, X } from "lucide-react";
import logo from "@/assets/selthiron-logo.png";
import type { ReconciliationReport, MatchResult } from "@/lib/reconciliation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const statusConfig = {
  matched: { icon: CheckCircle2, label: "Matched", className: "text-success", bg: "bg-success/10" },
  unmatched: { icon: XCircle, label: "Unmatched", className: "text-destructive", bg: "bg-destructive/10" },
  discrepancy: { icon: AlertTriangle, label: "Discrepancy", className: "text-warning", bg: "bg-warning/10" },
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const report = location.state?.report as ReconciliationReport | undefined;
  const [showLoginModal, setShowLoginModal] = useState(false);

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
          <img src={logo} alt="Selthiron" className="h-6" />
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/access")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Sign in to save
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/tool")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              New reconciliation
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Reconciliation Report</h1>
            <p className="text-sm text-muted-foreground">
              {report.totalBank} bank transactions · {report.totalProvider} provider transactions
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <SummaryCard
            label="Match Rate"
            value={`${report.matchRate?.toFixed(0) || 0}%`}
            className="text-success"
          />
          <SummaryCard label="Matched" value={report.matched || 0} className="text-success" />
          <SummaryCard label="Unmatched" value={report.unmatched || 0} className="text-destructive" />
          <SummaryCard label="Discrepancies" value={report.discrepancies || 0} className="text-warning" />
        </div>

        {/* Results Table */}
        <div className="bg-surface-elevated border rounded-xl overflow-hidden shadow-sm">
          <div className="hidden md:grid grid-cols-[100px_1fr_110px_110px_100px] gap-4 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b bg-surface">
            <span>Date</span>
            <span>Description</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Provider</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {report.results.map((r, i) => (
              <ResultRow key={i} result={r} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          {isAuthenticated ? (
            <p className="text-xs text-muted-foreground">
              This reconciliation has been saved to your account history.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Your reconciliation is ready. Sign in to save it to your history.
            </p>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && !isAuthenticated && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Save your reconciliation</h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in to save this reconciliation to your history and access it later.
            </p>
            <Button
              className="w-full"
              onClick={() => navigate("/access")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Sign in to save
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
    <p className={`text-2xl font-semibold font-sans ${className || ""}`}>{value}</p>
  </div>
);

const ResultRow = ({ result }: { result: MatchResult }) => {
  const config = statusConfig[result.status];
  const Icon = config.icon;

  // Handle unmatched provider transactions (bankTx is null)
  if (!result.bankTx && result.providerTx) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_110px_110px_100px] gap-2 md:gap-4 px-6 py-4 text-sm hover:bg-surface transition-colors bg-destructive/5">
        <span className="text-muted-foreground">—</span>
        <span className="font-medium truncate text-muted-foreground italic">Provider only</span>
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
