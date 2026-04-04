import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DynamicBackground } from "@/components/DynamicBackground";
import { StatCard } from "@/components/StatCard";
import { TestPanel } from "@/components/TestPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { OverlayURLPanel } from "@/components/OverlayURLPanel";
import { LiveMonitorPanel } from "@/components/LiveMonitorPanel";
import { useOverlayStore } from "@/hooks/useOverlayStore";
import { applyTheme, getThemeColors } from "@/lib/theme";

const Index = () => {
  const store = useOverlayStore();
  const { 
    setIsConnected, addChat, addGift, addJoin, addLike, setStats,
    settings, updateSettings, isConnected, stats
  } = store;
  
  const [activeTab, setActiveTab] = useState<"monitor" | "test" | "settings" | "preview">("monitor");
  const [bc] = useState(() => new BroadcastChannel("overlay-events"));

  // Apply visual theme globally
  useEffect(() => {
    applyTheme(settings.themeMode, settings.themeTemplate, settings.customPrimaryColor, settings.auroraCardColors);
  }, [settings.themeMode, settings.themeTemplate, settings.customPrimaryColor, settings.auroraCardColors]);

  // Compute current theme colors for React component props
  const themeColors = getThemeColors(settings.themeTemplate, settings.customPrimaryColor, settings.auroraCardColors);
  
  // Real-time Socket.IO integration
  useEffect(() => {
    import("../lib/socket").then(({ socket }) => {
      socket.connect();

      socket.on("tiktok_connected", () => {
        setIsConnected(true);
      });

      socket.on("tiktok_disconnected", () => {
        setIsConnected(false);
      });

      socket.on("tiktok_error", (err) => {
        console.error("TikTok Error:", err);
        setIsConnected(false);
      });

      socket.on("chat", (data) => {
        addChat(data);
        bc.postMessage({ type: "chat", data: { ...data, id: crypto.randomUUID(), timestamp: Date.now() } });
      });

      socket.on("gift", (data) => {
        addGift(data);
        bc.postMessage({ type: "gift", data: { ...data, id: crypto.randomUUID(), timestamp: Date.now() } });
      });

      socket.on("join", (data) => {
        addJoin(data);
        bc.postMessage({ type: "join", data: { ...data, id: crypto.randomUUID(), timestamp: Date.now() } });
      });

      socket.on("like", () => {
        addLike();
        bc.postMessage({ type: "like" });
      });

      socket.on("viewerCount", (data) => {
        setStats((prev) => ({ ...prev, currentViewers: data.viewers, peakViewers: Math.max(prev.peakViewers, data.viewers) }));
        bc.postMessage({ type: "viewerCount", data });
      });

      return () => {
        socket.off("tiktok_connected");
        socket.off("tiktok_disconnected");
        socket.off("tiktok_error");
        socket.off("chat");
        socket.off("gift");
        socket.off("join");
        socket.off("like");
        socket.off("viewerCount");
      };
    });
  }, [bc, setIsConnected, addChat, addGift, addJoin, addLike, setStats]);

  const handleTestChat = useCallback((username: string, message: string) => {
    const data = { id: crypto.randomUUID(), username, message, timestamp: Date.now() };
    addChat({ username, message });
    bc.postMessage({ type: "chat", data });
  }, [addChat, bc]);

  const handleTestGift = useCallback((username: string, giftName: string, giftCount: number) => {
    const coins = giftName === "Lion" ? 29999 : giftName === "Universe" ? 34999 : 1;
    const data = { id: crypto.randomUUID(), username, giftName, giftCount, coins, timestamp: Date.now() };
    addGift({ username, giftName, giftCount, coins });
    bc.postMessage({ type: "gift", data });
  }, [addGift, bc]);

  const handleTestJoin = useCallback((username: string) => {
    const data = { id: crypto.randomUUID(), username, timestamp: Date.now() };
    addJoin({ username });
    bc.postMessage({ type: "join", data });
  }, [addJoin, bc]);

  const handleConnect = useCallback(() => {
    if (settings.tiktokUsername) {
      import("../lib/socket").then(({ socket }) => {
        socket.emit("connect_tiktok", settings.tiktokUsername);
      });
    }
  }, [settings.tiktokUsername]);

  const handleDisconnect = useCallback(() => {
    import("../lib/socket").then(({ socket }) => {
      socket.emit("disconnect_tiktok");
    });
    setIsConnected(false);
  }, [setIsConnected]);

  const tabs = [
    { id: "monitor" as const, label: "💻 Monitor" },
    { id: "test" as const, label: "⚡ Test" },
    { id: "settings" as const, label: "⚙️ Settings" },
    { id: "preview" as const, label: "👁 Overlay" },
  ];

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />

      <div className="relative z-10 p-4 md:p-6 lg:p-8 4k:p-12 max-w-[2560px] mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl 4k:text-6xl font-display font-bold text-foreground leading-none">
                MONOLITH<span className="text-primary">OVERLAY</span>
              </h1>
              <p className="text-xs md:text-sm font-mono text-muted-foreground mt-1 uppercase tracking-widest">
                TikTok / OBS Live Overlay Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 ${store.isConnected ? "bg-accent animate-pulse-glow" : "bg-secondary"}`} />
              <span className="text-xs font-mono text-muted-foreground uppercase">
                {store.isConnected ? `@${store.settings.tiktokUsername}` : "Not connected"}
              </span>
            </div>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard
            label="Total Views"
            value={store.stats.totalViews}
            icon={<span className="text-2xl">👁</span>}
            color={themeColors.cardColors ? themeColors.cardColors[0] : themeColors.primary}
          />
          <StatCard
            label="Total Gifts"
            value={store.stats.totalGifts}
            icon={<span className="text-2xl">🎁</span>}
            color={themeColors.cardColors ? themeColors.cardColors[1] : themeColors.primary}
          />
          <StatCard
            label="Total Likes"
            value={store.stats.totalLikes}
            icon={<span className="text-2xl">❤️</span>}
            color={themeColors.cardColors ? themeColors.cardColors[2] : themeColors.primary}
          />
          <StatCard
            label="Peak Viewers"
            value={store.stats.peakViewers}
            icon={<span className="text-2xl">📈</span>}
            color={themeColors.cardColors ? themeColors.cardColors[3] : themeColors.primary}
          />
        </div>

        {/* Workspace Area */}
        <div className="w-full flex flex-col mt-4 md:mt-8">
          {/* Tab Navigation */}
          <div className="flex justify-start gap-3 md:gap-4 mb-6 overflow-x-auto px-1 md:px-0 pb-2 pt-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 brutal-btn text-xs md:text-sm px-4 py-2 md:px-6 md:py-3 ${
                  activeTab === tab.id
                    ? "" 
                    : "bg-muted text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="w-full relative z-0">
          
          {/* Monitor */}
          <div className={`${activeTab === "monitor" ? "block" : "hidden"}`}>
            <LiveMonitorPanel />
          </div>

          {/* Test Panel */}
          <div className={`${activeTab === "test" ? "block" : "hidden"}`}>
            <TestPanel
              onTestChat={handleTestChat}
              onTestGift={handleTestGift}
              onTestJoin={handleTestJoin}
              onTestLike={store.addLike}
            />
          </div>

          {/* Overlay Output */}
          <div className={`${activeTab === "preview" ? "block" : "hidden"}`}>
            <OverlayURLPanel />
          </div>

          {/* Settings */}
          <div className={`${activeTab === "settings" ? "block" : "hidden"}`}>
            <SettingsPanel
              settings={store.settings}
              onUpdate={store.updateSettings}
              isConnected={store.isConnected}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            MonolithOverlay • Built for TikTok Live • Use /overlay as Browser Source in OBS
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
