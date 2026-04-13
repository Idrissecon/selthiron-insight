import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertTriangle, ArrowLeft, Eye, Trash2, Pencil } from "lucide-react";
import logo from "@/assets/selthiron-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

const History = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

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

  const deleteReconciliation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reconciliations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReconciliations(reconciliations.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      // Silently fail - user can try again
    }
  };

  const renameReconciliation = async (id: string) => {
    if (!newName.trim()) return;
    try {
      const { error } = await supabase
        .from('reconciliations')
        .update({ name: newName.trim() })
        .eq('id', id);

      if (error) throw error;
      setReconciliations(reconciliations.map(r => 
        r.id === id ? { ...r, name: newName.trim() } : r
      ));
      setRenameId(null);
      setNewName("");
    } catch (error) {
      // Silently fail - user can try again
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('history.loadingHistory')}</p>
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
            {t('results.newReconciliation')}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-2xl font-semibold mb-2">{t('history.title')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('history.description')}
        </p>

        {reconciliations.length === 0 ? (
          <div className="bg-surface-elevated border rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('history.noHistory')}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t('history.emptyStateMessage')}
            </p>
            <Button onClick={() => navigate("/tool")}>{t('history.startReconciliation')}</Button>
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
                      {renameId === rec.id ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onBlur={() => renameReconciliation(rec.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') renameReconciliation(rec.id);
                            if (e.key === 'Escape') {
                              setRenameId(null);
                              setNewName("");
                            }
                          }}
                          className="font-medium bg-surface border rounded px-2 py-1 w-64"
                          autoFocus
                        />
                      ) : (
                        <p className="font-medium">
                          {rec.name || `${new Date(rec.created_at).toLocaleDateString()} ${t('history.at')} ${new Date(rec.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {rec.files?.length || 0} {t('history.files')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewReconciliation(rec.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t('history.view')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRenameId(rec.id);
                          setNewName(rec.name || "");
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        {t('history.rename')}
                      </Button>
                      {deleteConfirm === rec.id ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteReconciliation(rec.id)}
                        >
                          {t('history.delete')}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(rec.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t('history.delete')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">{t('history.matchRate')}</p>
                    <p className={`font-metric ${
                      rec.match_rate >= 80 ? 'text-success' :
                      rec.match_rate >= 50 ? 'text-warning' :
                      'text-destructive'
                    }`}>
                      {rec.match_rate?.toFixed(0) || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t('history.matched')}</p>
                    <p className="font-metric">{rec.matched || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t('history.unmatched')}</p>
                    <p className="font-metric text-destructive">{rec.unmatched || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t('history.discrepancies')}</p>
                    <p className="font-metric text-warning">{rec.discrepancies || 0}</p>
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
