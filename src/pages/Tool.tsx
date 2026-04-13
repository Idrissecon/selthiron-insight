import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ArrowRight, Shield, Loader2, LogOut, Clock } from "lucide-react";
import logo from "@/assets/selthiron-logo.png";
import { parseTransactions, reconcile, type ReconciliationReport } from "@/lib/reconciliation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const Tool = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [providerFile, setProviderFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Generate session ID for tracking unassigned results
  const sessionId = crypto.randomUUID();

  const handleDrop = useCallback(
    (setter: (f: File) => void) => (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith(".csv")) setter(file);
    },
    []
  );

  const handleFileSelect = (setter: (f: File) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setter(file);
  };

  const handleReconcile = async () => {
    if (!bankFile || !providerFile) return;
    setProcessing(true);
    setError("");

    try {
      // Process locally for results display
      const [bankText, providerText] = await Promise.all([
        bankFile.text(),
        providerFile.text(),
      ]);

      const bankTxs = parseTransactions(bankText);
      const providerTxs = parseTransactions(providerText);

      // Simulate processing delay for realism
      await new Promise((r) => setTimeout(r, 1500));

      const report = reconcile(bankTxs, providerTxs);

      // Save results to Supabase (always, but with session_id if not authenticated)
      try {
        const expiresAt = new Date(Date.now() + 16 * 60 * 1000).toISOString(); // 16 minutes from now (margin for network delay)

        // Only save session_id to localStorage if not authenticated
        if (!isAuthenticated) {
          localStorage.setItem('pending_result_session_id', sessionId);
        }

        // Save reconciliation results to database
        const { error: recError } = await supabase
          .from('reconciliations')
          .insert({
            total_bank: report.totalBank,
            total_provider: report.totalProvider,
            matched: report.matched,
            unmatched: report.unmatched,
            discrepancies: report.discrepancies,
            match_rate: report.matchRate,
            reconcilable_bank: report.reconcilableBank,
            reconcilable_provider: report.reconcilableProvider,
            results: report.results,
            user_id: isAuthenticated && user ? user.id : null,
            session_id: isAuthenticated ? null : sessionId,
            expires_at: isAuthenticated ? null : expiresAt,
          });

        if (recError) throw recError;
      } catch (err) {
        // If saving fails, continue to results anyway
        console.error("Failed to save to Supabase:", err);
      }

      // Navigate to results
      navigate("/results", { state: { report, sessionId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProcessing(false);
    }
  };

  const FileDropZone = ({
    label,
    file,
    setter,
    id,
  }: {
    label: string;
    file: File | null;
    setter: (f: File) => void;
    id: string;
  }) => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop(setter)}
      className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/40 hover:bg-surface transition-all cursor-pointer"
      onClick={() => document.getElementById(id)?.click()}
    >
      <input
        type="file"
        id={id}
        accept=".csv"
        className="hidden"
        onChange={handleFileSelect(setter)}
      />
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="w-5 h-5 text-success" />
          <span className="font-medium text-sm">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            ({(file.size / 1024).toFixed(1)} KB)
          </span>
        </div>
      ) : (
        <>
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-sm mb-1">{label}</p>
          <p className="text-xs text-muted-foreground">
            Drag & drop or click to browse (.csv)
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto flex items-center justify-between h-14 px-6">
          <img src={logo} alt="Selthiron" className="h-20 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(isAuthenticated ? "/tool" : "/")} />
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/history")}
                  className="text-xs"
                >
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  History
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-xs"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/access")}
                className="text-xs"
              >
                <Shield className="w-3.5 h-3.5 mr-2" />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-2">Upload your files</h1>
        <p className="text-muted-foreground mb-10">
          Upload your bank statement and payment provider export to begin reconciliation.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Bank Statement (CSV)</label>
            <FileDropZone label="Drop your bank CSV here" file={bankFile} setter={setBankFile} id="bank-file" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Payment Provider (CSV)</label>
            <FileDropZone
              label="Drop your Stripe / PayPal CSV here"
              file={providerFile}
              setter={setProviderFile}
              id="provider-file"
            />
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            disabled={!bankFile || !providerFile || processing}
            onClick={handleReconcile}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Reconcile
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        <div className="mt-12 p-4 bg-surface rounded-lg border">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Privacy notice:</strong> Your files are processed locally in your browser. Results are saved temporarily and assigned to your account when you sign in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tool;
