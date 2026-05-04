const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Murojaat24. Barcha huquqlar himoyalangan.
          </p>
          <p className="text-sm text-muted-foreground">
            Ishonch telefoni:{" "}
            <a href="tel:1089" className="hover:text-primary transition-colors">
              1089
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
