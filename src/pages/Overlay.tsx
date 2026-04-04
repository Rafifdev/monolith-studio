import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { applyTheme, ThemeMode, ThemeTemplate } from "@/lib/theme";
import type { ChatMessage, GiftEvent, ViewerJoinEvent, OverlaySettings, Stats } from "@/hooks/useOverlayStore";

const defaultSettings: OverlaySettings = {
  chatEnabled: true,
  giftEnabled: true,
  viewerCountEnabled: true,
  joinNotifEnabled: true,
  chatFontSize: 14,
  chatMaxMessages: 15,
  giftDuration: 5,
  overlayPosition: "left",
  tiktokUsername: "",
  cloudflareUrl: "",
  themeMode: "dark",
  themeTemplate: "brutal",
  customPrimaryColor: "#9b00ff",
  auroraCardColors: ["#ff2d78", "#00f5d4", "#fee440", "#9b5de5"],
};

export default function Overlay() {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [gifts, setGifts] = useState<GiftEvent[]>([]);
  const [joins, setJoins] = useState<ViewerJoinEvent[]>([]);
  const [settings, setSettings] = useState<OverlaySettings>(defaultSettings);
  const [stats, setStats] = useState<Stats>({ totalViews: 0, totalGifts: 0, totalLikes: 0, peakViewers: 0, currentViewers: 0 });
  const [targetModule, setTargetModule] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<string | null>(null);
  const [isStatic, setIsStatic] = useState(false);

  // Override settings via URL ?pos=left|right or ?module=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pos = params.get("pos");
    const mod = params.get("module");
    const layout = params.get("layout");
    const stat = params.get("static") === "true";
    
    const mode = params.get("mode") as ThemeMode | null;
    const theme = params.get("theme") as ThemeTemplate | null;
    const primary = params.get("primary");
    const aurora = params.get("aurora");

    if (aurora) {
      const colors = aurora.split(",");
      if (colors.length === 4) {
        setSettings(prev => ({ ...prev, auroraCardColors: colors }));
        applyTheme(mode || "dark", theme || "brutal", primary || undefined, colors);
      }
    } else if (mode || theme || primary) {
      applyTheme(mode || "dark", theme || "brutal", primary || undefined);
    }

    if (pos === "left" || pos === "right") {
      setSettings(prev => ({ ...prev, overlayPosition: pos }));
    }
    if (mod) setTargetModule(mod);
    if (layout) setLayoutMode(layout);
    
    if (stat) {
      setIsStatic(true);
      setStats({ totalViews: 0, totalGifts: 0, totalLikes: 0, peakViewers: 0, currentViewers: 1234 });
      setChats([
        { id: '1', username: 'static_viewer', message: 'Hello stream! 🔥', timestamp: Date.now() },
        { id: '2', username: 'pro_gamer', message: 'GGWP', timestamp: Date.now() }
      ]);
      setGifts([
        { id: '1', username: 'sugar_daddy', giftName: 'Rose', giftCount: 1, coins: 1, timestamp: Date.now() }
      ]);
      setJoins([
        { id: '1', username: 'new_follower', timestamp: Date.now() }
      ]);
    }
  }, []);

  // Clean old events
  useEffect(() => {
    if (isStatic) return; // Do not animate out or sweep static dummy data
    const interval = setInterval(() => {
      const now = Date.now();
      setGifts((prev) => prev.filter((g) => now - g.timestamp < settings.giftDuration * 1000));
      setJoins((prev) => prev.filter((j) => now - j.timestamp < 4000));
    }, 500);
    return () => clearInterval(interval);
  }, [settings.giftDuration, isStatic]);

  // Listen for broadcast events from dashboard AND socket
  useEffect(() => {
    const bc = new BroadcastChannel("overlay-events");
    bc.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === "chat") setChats((prev) => [...prev.slice(-29), data]);
      if (type === "gift") setGifts((prev) => [...prev, data]);
      if (type === "join") setJoins((prev) => [...prev, data]);
      if (type === "like") setStats((prev) => ({ ...prev, totalLikes: prev.totalLikes + 1 }));
      if (type === "viewerCount" && data) setStats((prev) => ({ ...prev, currentViewers: data.viewers }));
    };

    let cleanupSocket = () => {};

    import("../lib/socket").then(({ socket }) => {
      socket.connect();

      const onChat = (data: any) => {
        setChats((prev) => [...prev.slice(-29), { ...data, id: crypto.randomUUID(), timestamp: Date.now() }]);
      };
      
      const onGift = (data: any) => {
        setGifts((prev) => [...prev, { ...data, id: crypto.randomUUID(), timestamp: Date.now() }]);
      };

      const onJoin = (data: any) => {
        setJoins((prev) => [...prev, { ...data, id: crypto.randomUUID(), timestamp: Date.now() }]);
      };

      const onViewerCount = (data: any) => {
        setStats((prev) => ({ ...prev, currentViewers: data.viewers }));
      };

      socket.on("chat", onChat);
      socket.on("gift", onGift);
      socket.on("join", onJoin);
      socket.on("viewerCount", onViewerCount);

      cleanupSocket = () => {
        socket.off("chat", onChat);
        socket.off("gift", onGift);
        socket.off("join", onJoin);
        socket.off("viewerCount", onViewerCount);
      };
    });

    return () => {
      bc.close();
      cleanupSocket();
    };
  }, []);

  const visibleChats = chats.slice(-settings.chatMaxMessages);
  
  const isMonitor = layoutMode === 'monitor';
  const isMonolithOrMonitor = !targetModule;
  
  const showViewerCount = isMonolithOrMonitor ? settings.viewerCountEnabled : targetModule === 'viewer';
  const showGift = isMonolithOrMonitor ? settings.giftEnabled : targetModule === 'gift';
  const showJoin = isMonolithOrMonitor ? settings.joinNotifEnabled : targetModule === 'join';
  const showChat = isMonolithOrMonitor ? settings.chatEnabled : targetModule === 'chat';

  // For modular views, we center/fill the width so users can crop/place natively in OBS
  const posClass = !targetModule 
    ? (settings.overlayPosition === "left" ? "left-0 top-0 bottom-0" : "right-0 top-0 bottom-0")
    : "left-0 right-0 top-0 bottom-0";
  const wrapperClass = !targetModule ? "w-[400px]" : "w-full";

  const viewerCountEl = showViewerCount && (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute top-4 right-4 text-foreground px-3 py-1 font-mono text-sm font-bold border-[2px] border-foreground z-50 rounded-none overflow-hidden"
      style={{ 
        backgroundColor: settings.themeTemplate === "aurora" ? settings.auroraCardColors[0] : "hsl(var(--accent))",
        boxShadow: "2px 2px 0 #000" 
      }}
    >
      👁 {stats.currentViewers}
    </motion.div>
  );

  const giftsEl = showGift && (
    <AnimatePresence>
      {gifts.map((gift) => (
        <motion.div
          key={gift.id}
          initial={{ x: -200, opacity: 0, scale: 0.5 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 200, opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-foreground px-4 py-3 font-mono text-sm font-bold border-[3px] border-foreground self-start shrink-0"
          style={{ 
            backgroundColor: settings.themeTemplate === "aurora" ? settings.auroraCardColors[1] : "hsl(var(--primary))",
            boxShadow: "4px 4px 0 #000" 
          }}
        >
          🎁 <span className="font-bold">{gift.username}</span> sent {gift.giftCount}x {gift.giftName}
        </motion.div>
      ))}
    </AnimatePresence>
  );

  const joinsEl = showJoin && (
    <AnimatePresence>
      {joins.map((join) => (
        <motion.div
          key={join.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="font-mono text-xs"
          style={{ color: settings.themeTemplate === "aurora" ? settings.auroraCardColors[2] : "hsl(var(--accent))" }}
        >
          → {join.username} joined the stream
        </motion.div>
      ))}
    </AnimatePresence>
  );

  const chatsEl = showChat && (
    <div className="space-y-1">
      <AnimatePresence initial={false}>
        {visibleChats.map((chat) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-2 items-start"
            style={{ fontSize: settings.chatFontSize }}
          >
            <span
              className="font-mono font-bold shrink-0 px-1"
              style={{ 
                color: settings.themeTemplate === "aurora" ? settings.auroraCardColors[3] : "hsl(var(--primary))", 
                textShadow: "1px 1px 0 hsl(0 0% 0%)" 
              }}
            >
              {chat.username}
            </span>
            <span style={{ color: "hsl(60 20% 92%)", textShadow: "1px 1px 2px hsl(0 0% 0% / 0.8)" }}>
              {chat.message}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  if (isMonitor) {
    return (
      <div className="w-screen h-screen relative overflow-hidden" style={{ background: "transparent" }}>
        {viewerCountEl}
        <div className="absolute top-4 left-4 flex flex-col gap-2 w-[400px] max-w-[35vw]">
          {giftsEl}
        </div>
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 w-[350px] max-w-[35vw] items-end text-right">
          {joinsEl}
        </div>
        <div className="absolute bottom-4 left-4 flex flex-col justify-end w-[400px] max-w-[35vw] max-h-[60%] overflow-hidden gap-2">
          {chatsEl}
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden" style={{ background: "transparent" }}>
      <div className={`absolute ${posClass} ${wrapperClass} mx-auto flex flex-col justify-end p-4 gap-2`}>
        {viewerCountEl}
        {giftsEl}
        {joinsEl}
        {chatsEl}
      </div>
    </div>
  );
}
