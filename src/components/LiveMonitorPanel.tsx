import { motion } from "framer-motion";
import { useOverlayStore } from "@/hooks/useOverlayStore";

export function LiveMonitorPanel() {
  const { settings } = useOverlayStore();
  const themeQuery = `&mode=${settings.themeMode}&theme=${settings.themeTemplate}&primary=${encodeURIComponent(settings.customPrimaryColor)}`;
  const url = `/overlay?layout=monitor${themeQuery}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="brutal-card space-y-6"
    >
      <div className="flex items-center justify-between border-b-[3px] border-foreground pb-2">
        <h3 className="text-lg font-display uppercase tracking-wider">
          📺 Live Dashboard Monitor
        </h3>
        <span className="brutal-badge bg-accent text-accent-foreground text-[10px] animate-pulse-glow flex items-center gap-1">
          <span className="block w-2 h-2 rounded-full bg-accent-foreground" />
          ACTIVE
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-mono text-muted-foreground mb-4">
          Tampilan terpusat dari seluruh aktivitas live stream Anda.
        </p>
        <div
          className="relative border-[3px] border-foreground overflow-hidden bg-black mx-auto w-full flex justify-center items-center rounded-sm"
          style={{ aspectRatio: "16/9", maxHeight: "60vh" }}
        >
          <iframe
            src={url}
            className="w-full h-full border-0 absolute inset-0"
            title="Live Monitor"
            style={{ background: "transparent" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
