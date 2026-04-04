import { motion } from "framer-motion";
import type { OverlaySettings } from "@/hooks/useOverlayStore";

interface SettingsPanelProps {
  settings: OverlaySettings;
  onUpdate: (partial: Partial<OverlaySettings>) => void;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function SettingsPanel({ settings, onUpdate, isConnected, onConnect, onDisconnect }: SettingsPanelProps) {
  

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="brutal-card space-y-6"
    >
      <h3 className="text-lg font-display uppercase tracking-wider border-b-[3px] border-foreground pb-2">
        ⚙️ Settings
      </h3>

      {/* TikTok Connection */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          TikTok Username
        </label>
        <input
          className="brutal-input text-sm"
          placeholder="@username"
          value={settings.tiktokUsername}
          onChange={(e) => onUpdate({ tiktokUsername: e.target.value })}
        />
        <button
          className={isConnected ? "brutal-btn-secondary w-full text-sm" : "brutal-btn w-full text-sm"}
          onClick={isConnected ? onDisconnect : onConnect}
        >
          {isConnected ? "⏹ Disconnect" : "▶ Connect"}
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${isConnected ? "bg-accent" : "bg-secondary"}`} />
          <span className="text-xs font-mono text-muted-foreground">
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </div>


      {/* Toggles */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Overlay Components
        </label>
        {([
          ["chatEnabled", "Chat Overlay"],
          ["giftEnabled", "Gift Alerts"],
          ["viewerCountEnabled", "Viewer Count"],
          ["joinNotifEnabled", "Join Notifications"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-6 h-6 border-[3px] border-foreground flex items-center justify-center transition-colors ${
                settings[key] ? "bg-primary" : "bg-muted"
              }`}
              onClick={() => onUpdate({ [key]: !settings[key] })}
            >
              {settings[key] && <span className="text-primary-foreground font-bold text-sm">✓</span>}
            </div>
            <span className="text-sm font-mono group-hover:text-primary transition-colors">{label}</span>
          </label>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Chat Font Size: {settings.chatFontSize}px
          </label>
          <input
            type="range"
            min={10}
            max={24}
            value={settings.chatFontSize}
            onChange={(e) => onUpdate({ chatFontSize: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Max Chat Messages: {settings.chatMaxMessages}
          </label>
          <input
            type="range"
            min={5}
            max={30}
            value={settings.chatMaxMessages}
            onChange={(e) => onUpdate({ chatMaxMessages: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Gift Duration: {settings.giftDuration}s
          </label>
          <input
            type="range"
            min={2}
            max={15}
            value={settings.giftDuration}
            onChange={(e) => onUpdate({ giftDuration: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Overlay Position
        </label>
        <div className="flex gap-2">
          {(["left", "right"] as const).map((pos) => (
            <button
              key={pos}
              className={`flex-1 py-2 text-sm font-mono uppercase border-[3px] border-foreground transition-colors ${
                settings.overlayPosition === pos
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
              onClick={() => onUpdate({ overlayPosition: pos })}
              style={{ boxShadow: settings.overlayPosition === pos ? "var(--brutal-shadow-primary)" : "none" }}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
