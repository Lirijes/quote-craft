import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, Sparkles, Loader2 } from "lucide-react";
import sv from "@/i18n/sv.json";

const t = sv;

interface RequestInputProps {
  onGenerate: (text: string) => void;
  isGenerating: boolean;
}

export function RequestInput({ onGenerate, isGenerating }: RequestInputProps) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name ?? null);
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">{t.input.heading}</h2>
      <Textarea
        placeholder={t.input.placeholder}
        className="min-h-[160px] resize-y text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Upload className="h-4 w-4" />
          <span>{fileName ?? t.input.attachFile}</span>
          <Input
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            onChange={handleFileChange}
          />
        </label>
        <div className="flex-1" />
        <Button
          onClick={() => onGenerate(text)}
          disabled={!text.trim() || isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t.input.generate}
        </Button>
      </div>
    </Card>
  );
}
