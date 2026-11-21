import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import FileDropZone from "@/components/tools/FileDropZone";
import { Button } from "@/components/ui/button";
import { removeBackgroundLocal } from "@/lib/tools/removeBackgroundLocal";

const QuitarFondoPage = () => {
  const { t } = useTranslation("tools");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFile = (selected: File) => {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResultUrl(null);
    setError(null);
  };

  const handleRemove = async () => {
    if (!file) return;
    setProcessing(true);
    setProgressPct(0);
    setError(null);
    try {
      const blob = await removeBackgroundLocal(file, {
        output: { format: "image/png", quality: 0.9 },
        progress: (_key, current, total) => {
          setProgressPct(total > 0 ? Math.round((current / total) * 100) : 0);
        },
      });
      setResultUrl(URL.createObjectURL(blob));
      const base = file.name.replace(/\.[^.]+$/, "");
      setResultName(`${base}-sin-fondo.png`);
    } catch {
      setError(t("ui.error_generic"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setError(null);
    setProgressPct(0);
  };

  return (
    <ToolPageLayout toolId="quitar-fondo">
      <div className="border border-neutral-800 rounded-xl p-6 md:p-8">
        {!file ? (
          <FileDropZone
            accept="image/jpeg,image/png,image/webp"
            label={t("ui.upload_label")}
            hint={t("ui.upload_hint")}
            onFile={handleFile}
            toolId="quitar-fondo"
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-neutral-500 text-xs mb-2 text-center">
                  {t("ui.before_label")}
                </p>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full rounded-lg border border-neutral-800 object-contain max-h-64"
                  />
                )}
              </div>
              <div>
                <p className="text-neutral-500 text-xs mb-2 text-center">
                  {t("ui.after_label")}
                </p>
                <div
                  className="w-full rounded-lg border border-neutral-800 max-h-64 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  }}
                >
                  {resultUrl ? (
                    <img src={resultUrl} alt="" className="max-h-64 object-contain" />
                  ) : (
                    <span className="text-neutral-600 text-sm px-4 text-center">
                      {processing
                        ? `${t("ui.processing")} ${progressPct}%`
                        : t("ui.result_pending")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex flex-wrap gap-3">
              {!resultUrl ? (
                <Button
                  onClick={handleRemove}
                  isLoading={processing}
                  loadingText={`${t("ui.processing")} ${progressPct}%`}
                  className="bg-white text-black hover:bg-white/80 rounded-full px-8"
                >
                  {t("ui.remove_background_button")}
                </Button>
              ) : (
                <a href={resultUrl} download={resultName}>
                  <Button className="bg-white text-black hover:bg-white/80 rounded-full px-8">
                    <Download className="w-4 h-4" />
                    {t("ui.download_button")}
                  </Button>
                </a>
              )}
              <Button
                variant="outline"
                onClick={reset}
                className="rounded-full px-8 border-neutral-700 text-white bg-transparent hover:bg-white/10"
              >
                {t("ui.reset_button")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default QuitarFondoPage;
