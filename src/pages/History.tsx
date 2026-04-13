import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertTriangle, ArrowLeft, Eye } from "lucide-react";
import logo from "@/assets/selthiron-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/access");
      return;
    }

    loadHistory();
  }, [user, navigate]);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('reconciliations')
        .select(`
          *,
          files (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReconciliations(data || []);
    } catch (error) {
      // Silently fail - empty state will be shown
      setReconciliations([]);
    } finally {
      setLoading(false);
    }
  };

  const viewReconciliation = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('reconciliations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      navigate("/results", { state: { report: data } });
    } catch (error) {
      // Silently fail - user can try again
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
          <button onClick={() => navigate("/tool")} className="cursor-pointer hover:opacity-80 transition-opacity">
            <img src={logo} alt="Selthiron" className="h-20 bg-transparent" />
          </button>
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
                      rec.match_rate >= 80 ? 'bg-success/10 text-success' :
                      rec.match_rate >= 50 ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {rec.match_rate >= 80 ? <CheckCircle2 className="w-5 h-5" /> :
                       rec.match_rate >= 50 ? <AlertTriangle className="w-5 h-5" /> :
                       <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(rec.created_at).toLocaleDateString()} at {new Date(rec.created_at).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rec.files?.length || 0} files
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
                      rec.match_rate >= 80 ? 'text-success' :
                      rec.match_rate >= 50 ? 'text-warning' :
                      'text-destructive'
                    }`}>
                      {rec.match_rate?.toFixed(0) || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Matched</p>
                    <p className="font-semibold">{rec.matched || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Unmatched</p>
                    <p className="font-semibold text-destructive">{rec.unmatched || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Discrepancies</p>
                    <p className="font-semibold text-warning">{rec.discrepancies || 0}</p>
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
