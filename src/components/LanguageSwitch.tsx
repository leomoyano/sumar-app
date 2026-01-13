import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface LanguageSwitchProps {
  className?: string;
}

const LanguageSwitch = ({ className }: LanguageSwitchProps) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Label 
        htmlFor="language-switch" 
        className={`text-sm cursor-pointer ${language === 'es' ? 'font-semibold' : 'text-muted-foreground'}`}
      >
        ES
      </Label>
      <Switch
        id="language-switch"
        checked={language === 'en'}
        onCheckedChange={(checked) => setLanguage(checked ? 'en' : 'es')}
      />
      <Label 
        htmlFor="language-switch" 
        className={`text-sm cursor-pointer ${language === 'en' ? 'font-semibold' : 'text-muted-foreground'}`}
      >
        EN
      </Label>
    </div>
  );
};

export default LanguageSwitch;
