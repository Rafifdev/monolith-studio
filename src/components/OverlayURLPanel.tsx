import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useOverlayStore } from "@/hooks/useOverlayStore";

export function OverlayURLPanel() {
  const { settings } = useOverlayStore();
  
  const localBaseUrl = `${window.location.origin}/overlay`;
  const remoteBaseUrl = settings.cloudflareUrl 
    ? `${settings.cloudflareUrl.replace(/\/$/, "")}/overlay`
    : localBaseUrl;
    
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const auroraQuery = settings.themeTemplate === "aurora" ? `&aurora=${settings.auroraCardColors.join(",")}` : "";
  const themeQuery = `&mode=${settings.themeMode}&theme=${settings.themeTemplate}&primary=${encodeURIComponent(settings.customPrimaryColor)}${auroraQuery}`;

  const configs = [
    { id: "mod-chat", title: "Chat Module", localUrl: `${localBaseUrl}?module=chat${themeQuery}`, remoteUrl: `${remoteBaseUrl}?module=chat${themeQuery}`, ratio: "3/4" },
    { id: "mod-gift", title: "Gift Module", localUrl: `${localBaseUrl}?module=gift${themeQuery}`, remoteUrl: `${remoteBaseUrl}?module=gift${themeQuery}`, ratio: "3/4" },
    { id: "mod-viewer", title: "Viewer Count", localUrl: `${localBaseUrl}?module=viewer${themeQuery}`, remoteUrl: `${remoteBaseUrl}?module=viewer${themeQuery}`, ratio: "3/4" },
    { id: "mod-join", title: "Join Notifications", localUrl: `${localBaseUrl}?module=join${themeQuery}`, remoteUrl: `${remoteBaseUrl}?module=join${themeQuery}`, ratio: "3/4" },
  ];

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="brutal-card space-y-6"
    >
      <h3 className="text-lg font-display uppercase tracking-wider border-b-[3px] border-foreground pb-2">
        🖥 Overlay Output
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 border-[3px] border-foreground">
        {configs.map((conf) => (
          <div key={conf.id} className="space-y-2 flex flex-col justify-end">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-bold">
              {conf.title}
            </h4>
            
            {/* Static View iframe */}
            <div
              className={`relative border-[3px] border-foreground overflow-hidden bg-black mx-auto w-full max-h-[300px] flex justify-center items-center`}
              style={{ aspectRatio: conf.ratio }}
            >
              <iframe
                src={conf.localUrl.replace(window.location.origin, '') + '&static=true'}
                className="w-full h-full border-0 absolute inset-0 pointer-events-none"
                title={`${conf.title} Preview`}
                style={{ background: "transparent", width: "100%", height: "100%" }}
              />
            </div>

            {/* Copy Row */}
            <div className="flex gap-2 pt-1 items-stretch">
              <input 
                className="brutal-input text-xs font-mono h-auto px-2 py-1"
                readOnly 
                value={conf.remoteUrl}
              />
              <button
                className={`brutal-btn-accent shrink-0 px-3 flex items-center justify-center transition-colors ${
                  copiedId === conf.id ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => handleCopy(conf.id, conf.remoteUrl)}
                title="Copy URL"
              >
                {copiedId === conf.id ? <Check size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="space-y-2 border-t-[3px] border-foreground pt-3">
        <h4 className="text-xs font-mono uppercase tracking-widest text-primary">
          📡 Cara Pakai
        </h4>
        <div className="grid gap-2">
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 shrink-0 bg-primary text-primary-foreground border-[2px] border-foreground flex items-center justify-center text-xs font-mono font-bold">1</div>
            <div>
              <span className="text-xs font-mono font-bold text-foreground">OBS Studio</span>
              <p className="text-[10px] font-mono text-muted-foreground">Add Browser Source → resolusi sesuai area (cth: Chat 400x600, Viewer 200x50) → paste URL Modul secara terpisah agar mudah diposisikan.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 shrink-0 bg-primary text-primary-foreground border-[2px] border-foreground flex items-center justify-center text-xs font-mono font-bold">2</div>
            <div>
              <span className="text-xs font-mono font-bold text-foreground">TikTok Studio</span>
              <p className="text-[10px] font-mono text-muted-foreground">Add URL Source → paste URL Modul-modul ini ke scene Anda untuk menyusun tata letak live bebas hambatan.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
