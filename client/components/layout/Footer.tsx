import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const text = (t("footer.copyright") as string).replace("{year}", String(year));

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">{text}</p>
          <nav className="flex items-center gap-6 text-sm">
            <a href="/#مزايا" className="text-foreground/70 hover:text-foreground">المزايا</a>
            <a href="/#البنية" className="text-foreground/70 hover:text-foreground">البنية</a>
            <a href="/#الأسعار" className="text-foreground/70 hover:text-foreground">الأسعار</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
