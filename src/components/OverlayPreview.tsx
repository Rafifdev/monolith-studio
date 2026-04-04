import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage, GiftEvent, ViewerJoinEvent, OverlaySettings, Stats } from "@/hooks/useOverlayStore";

interface OverlayPreviewProps {
  chats: ChatMessage[];
  gifts: GiftEvent[];
  joins: ViewerJoinEvent[];
  settings: OverlaySettings;
  stats: Stats;
}

export function OverlayPreview({ chats, gifts, joins, settings, stats }: OverlayPreviewProps) {
  const recentGifts = gifts.filter((g) => Date.now() - g.timestamp < (settings.giftDuration * 1000));
  const recentJoins = joins.filter((j) => Date.now() - j.timestamp < 4000);
  const visibleChats = chats.slice(-settings.chatMaxMessages);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="brutal-card relative overflow-hidden"
      style={{ minHeight: 400, background: "hsl(60 5% 6% / 0.9)" }}
    >
      <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          ● Overlay Preview
        </h3>
        <div className="brutal-badge bg-secondary text-secondary-foreground animate-pulse-glow">
          PREVIEW
        </div>
      </div>

      <div className="pt-8 h-full flex flex-col justify-end gap-2 p-3">
        {/* Viewer Count */}
        {settings.viewerCountEnabled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-8 right-3 brutal-badge bg-accent text-accent-foreground"
          >
            👁 {stats.currentViewers.toLocaleString()} viewers
          </motion.div>
        )}

        {/* Gift Alerts */}
        {settings.giftEnabled && (
          <AnimatePresence>
            {recentGifts.map((gift) => (
              <motion.div
                key={gift.id}
                initial={{ x: -100, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 100, opacity: 0, scale: 0.8 }}
                className="brutal-badge bg-primary text-primary-foreground text-sm py-2 px-3 self-start"
              >
                🎁 <span className="font-bold">{gift.username}</span> sent {gift.giftCount}x {gift.giftName}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Join Notifications */}
        {settings.joinNotifEnabled && (
          <AnimatePresence>
            {recentJoins.map((join) => (
              <motion.div
                key={join.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-mono text-accent"
              >
                → {join.username} joined
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Chat Messages */}
        {settings.chatEnabled && (
          <div className="space-y-1 max-h-[250px] overflow-hidden">
            <AnimatePresence initial={false}>
              {visibleChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2 items-start"
                  style={{ fontSize: settings.chatFontSize }}
                >
                  <span className="font-mono font-bold text-primary shrink-0">{chat.username}:</span>
                  <span className="text-foreground">{chat.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
