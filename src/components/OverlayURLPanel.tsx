import { useState } from "react";
import { motion } from "framer-motion";

export function OverlayURLPanel() {
  const overlayUrl = `${window.location.origin}/overlay`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="brutal-card space-y-4"
    >
      <h3 className="text-lg font-display uppercase tracking-wider border-b-[3px] border-foreground pb-2">
        🖥 Overlay Output
      </h3>

      {/* Live Preview */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Live Preview
        </label>
        <div
          className="relative border-[3px] border-foreground overflow-hidden bg-black"
          style={{ aspectRatio: "16/9" }}
        >
          <iframe
            src="/overlay"
            className="w-full h-full border-0"
            title="Overlay Preview"
            style={{ background: "transparent" }}
          />
          <div className="absolute top-2 right-2">
            <span className="brutal-badge bg-accent text-accent-foreground text-[10px] animate-pulse-glow">
              LIVE
            </span>
          </div>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground">
          Preview overlay yang akan muncul di OBS/TikTok Studio
        </p>
      </div>

      {/* Copy URL */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Overlay URL
        </label>
        <div className="flex gap-2">
          <div className="brutal-input text-xs break-all flex-1 select-all font-mono">
            {overlayUrl}
          </div>
          <button
            className={`shrink-0 px-4 py-2 text-xs font-mono uppercase tracking-wider border-[3px] border-foreground font-bold transition-colors ${
              copied
                ? "bg-accent text-accent-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/80"
            }`}
            style={{ boxShadow: "var(--brutal-shadow-primary)" }}
            onClick={handleCopy}
          >
            {copied ? "✓ COPIED" : "📋 COPY"}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2 border-t-[3px] border-foreground pt-3">
        <h4 className="text-xs font-mono uppercase tracking-widest text-primary">
          📡 Cara Pakai
        </h4>
        <div className="grid gap-2">
          {[
            { step: "1", title: "OBS Studio", desc: "Add Browser Source → paste Overlay URL" },
            { step: "2", title: "TikTok Studio", desc: "Gunakan cloudflared tunnel untuk expose URL" },
            { step: "3", title: "Cloudflared", desc: `cloudflared tunnel --url ${window.location.origin}` },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 items-start">
              <div className="w-6 h-6 shrink-0 bg-primary text-primary-foreground border-[2px] border-foreground flex items-center justify-center text-xs font-mono font-bold">
                {item.step}
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-foreground">{item.title}</span>
                <p className="text-[10px] font-mono text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
