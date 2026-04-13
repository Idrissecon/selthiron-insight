import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, Lock, User } from "lucide-react";
import logo from "@/assets/selthiron-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

const Access = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  const { t } = useTranslation();
  const report = location.state?.report as any;
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }

      // Get the current session to get the user
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      // Always assign unassigned results to the user on authentication (strict discipline)
      if (currentUser) {
        const pendingSessionId = localStorage.getItem('pending_result_session_id');
        if (pendingSessionId) {
          try {
            await supabase.rpc('assign_results_to_user', {
              user_uuid: currentUser.id,
              session_id_param: pendingSessionId
            });
            // Clear localStorage after assignment
            localStorage.removeItem('pending_result_session_id');
          } catch (err) {
            console.error("Failed to assign results:", err);
          }
        }
      }

      // Navigate to Results if there's a report, otherwise to Tool
      if (report) {
        navigate("/results", { state: { report } });
      } else {
        navigate("/tool");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <button onClick={handleLogoClick} className="cursor-pointer hover:opacity-80 transition-opacity mx-auto mb-8">
            <img src={logo} alt="Selthiron" className="h-20 bg-transparent" />
          </button>
          <h1 className="text-2xl font-semibold mb-2">{isLogin ? t('welcomeBack') : t('createAccount')}</h1>
          <p className="text-muted-foreground">
            {isLogin ? t('signInToAccess') : t('signUpToStart')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('yourName')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? t('processing') : isLogin ? t('signIn') : t('signUp')}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
            </button>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>{t('yourDataSecure')}</span>
        </div>
      </div>
    </div>
  );
};

export default Access;
