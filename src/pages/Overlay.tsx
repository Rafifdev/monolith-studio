import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage, GiftEvent, ViewerJoinEvent, OverlaySettings, Stats } from "@/hooks/useOverlayStore";

const defaultSettings: OverlaySettings = {
  chatEnabled: true,
  giftEnabled: true,
  viewerCountEnabled: true,
  joinNotifEnabled: true,
  chatFontSize: 16,
  chatMaxMessages: 15,
  giftDuration: 5,
  overlayPosition: "left",
  tiktokUsername: "",
};

export default function Overlay() {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [gifts, setGifts] = useState<GiftEvent[]>([]);
  const [joins, setJoins] = useState<ViewerJoinEvent[]>([]);
  const [settings] = useState<OverlaySettings>(defaultSettings);
  const [stats] = useState<Stats>({ totalViews: 0, totalGifts: 0, totalLikes: 0, peakViewers: 0, currentViewers: 0 });

  // Clean old events
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setGifts((prev) => prev.filter((g) => now - g.timestamp < settings.giftDuration * 1000));
      setJoins((prev) => prev.filter((j) => now - j.timestamp < 4000));
    }, 500);
    return () => clearInterval(interval);
  }, [settings.giftDuration]);

  // Listen for broadcast events from dashboard
  useEffect(() => {
    const bc = new BroadcastChannel("overlay-events");
    bc.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === "chat") setChats((prev) => [...prev.slice(-29), data]);
      if (type === "gift") setGifts((prev) => [...prev, data]);
      if (type === "join") setJoins((prev) => [...prev, data]);
    };
    return () => bc.close();
  }, []);

  const visibleChats = chats.slice(-settings.chatMaxMessages);
  const posClass = settings.overlayPosition === "left" ? "left-0" : "right-0";

  return (
    <div className="w-screen h-screen relative overflow-hidden" style={{ background: "transparent" }}>
      <div className={`absolute ${posClass} bottom-0 top-0 w-[400px] flex flex-col justify-end p-4 gap-2`}>
        {/* Viewer Count */}
        {settings.viewerCountEnabled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 font-mono text-sm font-bold border-[2px] border-foreground"
            style={{ boxShadow: "2px 2px 0 hsl(60 20% 92%)" }}
          >
            👁 {stats.currentViewers}
          </motion.div>
        )}

        {/* Gift Alerts */}
        {settings.giftEnabled && (
          <AnimatePresence>
            {gifts.map((gift) => (
              <motion.div
                key={gift.id}
                initial={{ x: -200, opacity: 0, scale: 0.5 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 200, opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 15 }}
                className="bg-primary text-primary-foreground px-4 py-3 font-mono text-sm font-bold border-[3px] border-foreground self-start"
                style={{ boxShadow: "4px 4px 0 hsl(60 20% 92%)" }}
              >
                🎁 <span className="font-bold">{gift.username}</span> sent {gift.giftCount}x {gift.giftName}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Join Notifications */}
        {settings.joinNotifEnabled && (
          <AnimatePresence>
            {joins.map((join) => (
              <motion.div
                key={join.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-accent"
              >
                → {join.username} joined the stream
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Chat */}
        {settings.chatEnabled && (
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
                    style={{ color: "hsl(52 100% 50%)", textShadow: "1px 1px 0 hsl(0 0% 0%)" }}
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
        )}
      </div>
    </div>
  );
}
