import { useNavigate } from "react-router-dom";
import logo from "@/assets/selthiron-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const handleLogoClick = () => {
    navigate(isAuthenticated ? "/tool" : "/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto flex items-center justify-between h-20 px-6">
        <button onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img src={logo} alt="Selthiron" className="h-24 bg-transparent" />
        </button>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tool")}
            className="text-primary hover:text-primary/80"
          >
            {t('getStartedButton')}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
