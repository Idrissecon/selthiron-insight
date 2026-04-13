import { useNavigate } from "react-router-dom";
import logo from "@/assets/selthiron-logo.png";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLogoClick = () => {
    navigate(isAuthenticated ? "/tool" : "/");
  };

  return (
    <footer className="py-16 border-t">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <button onClick={handleLogoClick} className="cursor-pointer hover:opacity-80 transition-opacity">
          <img src={logo} alt="Selthiron" className="h-24 opacity-60 bg-transparent" />
        </button>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Selthiron. Privacy-first financial reconciliation.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
