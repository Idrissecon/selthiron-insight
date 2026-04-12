import logo from "@/assets/selthiron-logo.png";

const Footer = () => {
  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <img src={logo} alt="Selthiron" className="h-6 opacity-60" />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Selthiron. Privacy-first financial reconciliation.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
