import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs font-medium text-muted-foreground"
      onClick={() => setLang(lang === "sv" ? "en" : "sv")}
    >
      {lang === "sv" ? "EN 🇬🇧" : "SV 🇸🇪"}
    </Button>
  );
}
