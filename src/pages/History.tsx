import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertTriangle, ArrowLeft, Eye } from "lucide-react";
import logo from "@/assets/selthiron-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const History = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/access");
      return;
    }

    loadHistory();
  }, [token, navigate]);

  const loadHistory = async () => {
    try {
      const data = await api.getReconciliationHistory(token!);
      setReconciliations(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewReconciliation = async (id: string) => {
    try {
      const data = await api.getReconciliation(token!, id);
      navigate("/results", { state: { report: data } });
    } catch (error) {
      console.error("Failed to load reconciliation:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto flex items-center justify-between h-14 px-6">
          <img src={logo} alt="Selthiron" className="h-6" />
          <Button variant="ghost" size="sm" onClick={() => navigate("/tool")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            New reconciliation
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-2xl font-semibold mb-2">Reconciliation History</h1>
        <p className="text-muted-foreground mb-8">
          View your previous reconciliations and results.
        </p>

        {reconciliations.length === 0 ? (
          <div className="bg-surface-elevated border rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reconciliations yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start by uploading your first bank statement and provider export.
            </p>
            <Button onClick={() => navigate("/tool")}>Start reconciliation</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reconciliations.map((rec) => (
              <div
                key={rec.id}
                className="bg-surface-elevated border rounded-xl p-6 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      rec.matchRate >= 80 ? 'bg-success/10 text-success' :
                      rec.matchRate >= 50 ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {rec.matchRate >= 80 ? <CheckCircle2 className="w-5 h-5" /> :
                       rec.matchRate >= 50 ? <AlertTriangle className="w-5 h-5" /> :
                       <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(rec.createdAt).toLocaleDateString()} at {new Date(rec.createdAt).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rec.files.length} files
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewReconciliation(rec.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Match Rate</p>
                    <p className={`font-semibold ${
                      rec.matchRate >= 80 ? 'text-success' :
                      rec.matchRate >= 50 ? 'text-warning' :
                      'text-destructive'
                    }`}>
                      {rec.matchRate.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Matched</p>
                    <p className="font-semibold">{rec.matched}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Unmatched</p>
                    <p className="font-semibold text-destructive">{rec.unmatched}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Discrepancies</p>
                    <p className="font-semibold text-warning">{rec.discrepancies}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
