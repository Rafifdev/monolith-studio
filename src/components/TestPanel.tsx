import { useState } from "react";
import { motion } from "framer-motion";

interface TestPanelProps {
  onTestChat: (username: string, message: string) => void;
  onTestGift: (username: string, giftName: string, count: number) => void;
  onTestJoin: (username: string) => void;
  onTestLike: () => void;
}

const sampleChats = [
  { user: "user_123", msg: "Hai kak! 🔥" },
  { user: "tiktok_fan", msg: "Amazing stream!" },
  { user: "viewer_pro", msg: "Love the content 💯" },
];

const sampleGifts = [
  { name: "Rose", coins: 1 },
  { name: "TikTok", coins: 1 },
  { name: "Lion", coins: 29999 },
  { name: "Universe", coins: 34999 },
];

export function TestPanel({ onTestChat, onTestGift, onTestJoin, onTestLike }: TestPanelProps) {
  const [chatUser, setChatUser] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [giftUser, setGiftUser] = useState("");
  const [joinUser, setJoinUser] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="brutal-card space-y-6"
    >
      <h3 className="text-lg font-display uppercase tracking-wider border-b-[3px] border-foreground pb-2">
        ⚡ Test Controls
      </h3>

      {/* Test Chat */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Test Chat</label>
        <div className="flex gap-2">
          <input
            className="brutal-input text-sm flex-1"
            placeholder="Username"
            value={chatUser}
            onChange={(e) => setChatUser(e.target.value)}
          />
          <input
            className="brutal-input text-sm flex-1"
            placeholder="Message"
            value={chatMsg}
            onChange={(e) => setChatMsg(e.target.value)}
          />
        </div>
        <button
          className="brutal-btn w-full text-sm"
          onClick={() => {
            onTestChat(chatUser || "test_user", chatMsg || "Hello! 👋");
            setChatUser("");
            setChatMsg("");
          }}
        >
          Send Chat
        </button>
        <div className="flex flex-wrap gap-1">
          {sampleChats.map((s) => (
            <button
              key={s.msg}
              className="brutal-badge bg-muted text-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-[10px]"
              onClick={() => onTestChat(s.user, s.msg)}
            >
              {s.user}
            </button>
          ))}
        </div>
      </div>

      {/* Test Gift */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Test Gift</label>
        <input
          className="brutal-input text-sm"
          placeholder="Username"
          value={giftUser}
          onChange={(e) => setGiftUser(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          {sampleGifts.map((g) => (
            <button
              key={g.name}
              className="brutal-btn-secondary text-xs py-2 px-3"
              onClick={() => onTestGift(giftUser || "gift_sender", g.name, 1)}
            >
              🎁 {g.name} ({g.coins})
            </button>
          ))}
        </div>
      </div>

      {/* Test Join & Like */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Test Join</label>
        <div className="flex gap-2">
          <input
            className="brutal-input text-sm flex-1"
            placeholder="Username"
            value={joinUser}
            onChange={(e) => setJoinUser(e.target.value)}
          />
          <button
            className="brutal-btn-accent text-xs"
            onClick={() => {
              onTestJoin(joinUser || "new_viewer");
              setJoinUser("");
            }}
          >
            Join
          </button>
        </div>
        <button
          className="brutal-btn w-full text-sm bg-secondary text-secondary-foreground"
          onClick={onTestLike}
        >
          ❤️ Test Like
        </button>
      </div>
    </motion.div>
  );
}
