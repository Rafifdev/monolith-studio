import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DynamicBackground } from "@/components/DynamicBackground";
import { StatCard } from "@/components/StatCard";
import { TestPanel } from "@/components/TestPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { OverlayURLPanel } from "@/components/OverlayURLPanel";
import { useOverlayStore } from "@/hooks/useOverlayStore";
import { useOverlayStore } from "@/hooks/useOverlayStore";

const Index = () => {
  const store = useOverlayStore();
  const [activeTab, setActiveTab] = useState<"test" | "settings" | "preview">("test");
  const [bc] = useState(() => new BroadcastChannel("overlay-events"));

  // Clean old events for preview
  useEffect(() => {
    const interval = setInterval(() => {}, 500);
    return () => clearInterval(interval);
  }, []);

  const handleTestChat = useCallback((username: string, message: string) => {
    const data = { id: crypto.randomUUID(), username, message, timestamp: Date.now() };
    store.addChat({ username, message });
    bc.postMessage({ type: "chat", data });
  }, [store, bc]);

  const handleTestGift = useCallback((username: string, giftName: string, giftCount: number) => {
    const coins = giftName === "Lion" ? 29999 : giftName === "Universe" ? 34999 : 1;
    const data = { id: crypto.randomUUID(), username, giftName, giftCount, coins, timestamp: Date.now() };
    store.addGift({ username, giftName, giftCount, coins });
    bc.postMessage({ type: "gift", data });
  }, [store, bc]);

  const handleTestJoin = useCallback((username: string) => {
    const data = { id: crypto.randomUUID(), username, timestamp: Date.now() };
    store.addJoin({ username });
    bc.postMessage({ type: "join", data });
  }, [store, bc]);

  const handleConnect = useCallback(() => {
    if (store.settings.tiktokUsername) {
      store.setIsConnected(true);
    }
  }, [store]);

  const handleDisconnect = useCallback(() => {
    store.setIsConnected(false);
  }, [store]);

  const tabs = [
    { id: "test" as const, label: "⚡ Test" },
    { id: "settings" as const, label: "⚙️ Settings" },
    { id: "preview" as const, label: "👁 Preview" },
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
                STREAM<span className="text-primary">OVERLAY</span>
              </h1>
              <p className="text-xs md:text-sm font-mono text-muted-foreground mt-1 uppercase tracking-widest">
                TikTok Live Overlay Dashboard
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
            color="accent"
          />
          <StatCard
            label="Total Gifts"
            value={store.stats.totalGifts}
            icon={<span className="text-2xl">🎁</span>}
            color="primary"
          />
          <StatCard
            label="Total Likes"
            value={store.stats.totalLikes}
            icon={<span className="text-2xl">❤️</span>}
            color="secondary"
          />
          <StatCard
            label="Peak Viewers"
            value={store.stats.peakViewers}
            icon={<span className="text-2xl">📈</span>}
            color="primary"
          />
        </div>

        {/* Tab Navigation (mobile) */}
        <div className="flex lg:hidden gap-2 mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2 text-xs font-mono uppercase tracking-wider border-[3px] border-foreground transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
              style={{ boxShadow: activeTab === tab.id ? "var(--brutal-shadow-primary)" : "none" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Test Panel */}
          <div className={`${activeTab === "test" ? "block" : "hidden"} lg:block`}>
            <TestPanel
              onTestChat={handleTestChat}
              onTestGift={handleTestGift}
              onTestJoin={handleTestJoin}
              onTestLike={store.addLike}
            />
          </div>

          {/* Overlay Preview */}
          <div className={`${activeTab === "preview" ? "block" : "hidden"} lg:block`}>
            <OverlayPreview
              chats={store.chats}
              gifts={store.gifts}
              joins={store.joins}
              settings={store.settings}
              stats={store.stats}
            />
          </div>

          {/* Settings */}
          <div className={`${activeTab === "settings" ? "block" : "hidden"} lg:block`}>
            <SettingsPanel
              settings={store.settings}
              onUpdate={store.updateSettings}
              isConnected={store.isConnected}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
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
            StreamOverlay • Built for TikTok Live • Use /overlay as Browser Source in OBS
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
