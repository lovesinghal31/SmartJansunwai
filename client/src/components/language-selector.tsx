import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
];

interface LanguageSelectorProps {
  variant?: "select" | "buttons";
  showIcon?: boolean;
}

export function LanguageSelector({ variant = "select", showIcon = true }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  if (variant === "buttons") {
    return (
      <div className="flex items-center gap-2" data-testid="language-buttons">
        {showIcon && <Languages className="h-4 w-4" />}
        <div className="flex gap-1">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant={i18n.language === language.code ? "default" : "outline"}
              size="sm"
              onClick={() => changeLanguage(language.code)}
              data-testid={`button-lang-${language.code}`}
            >
              {language.code.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" data-testid="language-selector">
      {showIcon && <Languages className="h-4 w-4" />}
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            {currentLanguage.nativeName}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span>{language.nativeName}</span>
                <span className="text-muted-foreground text-sm">({language.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}