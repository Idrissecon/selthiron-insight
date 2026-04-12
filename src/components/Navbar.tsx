import { Link } from "react-router-dom";
import logo from "@/assets/selthiron-logo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto flex items-center justify-between h-20 px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Selthiron" className="h-12" />
        </Link>
        <Link
          to="/access"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Get started →
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
