import { motion } from "framer-motion";
import type { OverlaySettings } from "@/hooks/useOverlayStore";
import { THEME_PRESETS, AURORA_CARD_COLORS, generateAuroraColors } from "@/lib/theme";

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

      {/* Connection Settings */}
      <div className="space-y-4">
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
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Cloudflare Tunnel URL
          </label>
          <input
            className="brutal-input text-sm"
            placeholder="https://your-tunnel.trycloudflare.com"
            value={settings.cloudflareUrl}
            onChange={(e) => onUpdate({ cloudflareUrl: e.target.value })}
          />
        </div>

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

      {/* Theme & Appearance */}
      <div className="space-y-4 pt-2">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground border-b-[2px] border-foreground/20 pb-1 flex justify-between">
          <span>Theme & Appearance</span>
        </label>

        <div className="space-y-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Mode Tampilan</span>
          <div className="flex gap-2">
            {(["dark", "light"] as const).map((mode) => (
              <button
                key={mode}
                className={`flex-1 py-1.5 text-xs font-mono uppercase border-[2px] border-foreground transition-colors ${settings.themeMode === mode ? "bg-primary text-primary-foreground font-bold shadow-[2px_2px_0px_#000]" : "bg-muted text-foreground"
                  }`}
                onClick={() => onUpdate({ themeMode: mode })}
              >
                {mode === "dark" ? "🌙 Dark" : "☀️ Light"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Template Warna Khusus</span>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(THEME_PRESETS).map(([key, template]) => {
              // Aurora gets a special multi-color quarter swatch
              if (key === "aurora") {
                return (
                  <div
                    key={key}
                    onClick={() => {
                      const newColors = generateAuroraColors();
                      onUpdate({ themeTemplate: "aurora", auroraCardColors: newColors });
                    }}
                    className={`relative aspect-square cursor-pointer border-[2px] border-foreground hover:scale-105 transition-transform flex items-center justify-center overflow-hidden ${settings.themeTemplate === "aurora" ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                      }`}
                    title="Aurora (Klik untuk warna random!)"
                  >
                    <div className="w-full h-full grid grid-cols-2">
                      {(settings.auroraCardColors ?? AURORA_CARD_COLORS).map((c, i) => (
                        <div key={i} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={key}
                  onClick={() => onUpdate({ themeTemplate: key as any })}
                  className={`aspect-square cursor-pointer border-[2px] border-foreground hover:scale-105 transition-transform flex items-center justify-center ${settings.themeTemplate === key ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                    }`}
                  style={{ backgroundColor: template.hex }}
                  title={template.name}
                >
                  {settings.themeTemplate === key && <span className="text-[10px]" style={{ mixBlendMode: 'difference', color: '#fff' }}></span>}
                </div>
              );
            })}

            {/* Custom Theme Button */}
            <div
              onClick={() => onUpdate({ themeTemplate: "custom" })}
              className={`relative aspect-square cursor-pointer border-[2px] border-foreground overflow-hidden hover:scale-105 transition-transform flex items-center justify-center ${settings.themeTemplate === "custom" ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                }`}
              title="Custom Color"
              style={{ background: "linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)" }}
            >
              {settings.themeTemplate === "custom" && (
                <input
                  type="color"
                  value={settings.customPrimaryColor}
                  onChange={(e) => onUpdate({ customPrimaryColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
