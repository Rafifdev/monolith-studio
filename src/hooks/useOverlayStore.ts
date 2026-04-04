import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  avatar?: string;
}

export interface GiftEvent {
  id: string;
  username: string;
  giftName: string;
  giftCount: number;
  coins: number;
  timestamp: number;
}

export interface ViewerJoinEvent {
  id: string;
  username: string;
  timestamp: number;
}

export interface OverlaySettings {
  chatEnabled: boolean;
  giftEnabled: boolean;
  viewerCountEnabled: boolean;
  joinNotifEnabled: boolean;
  chatFontSize: number;
  chatMaxMessages: number;
  giftDuration: number;
  overlayPosition: "left" | "right";
  tiktokUsername: string;
}

export interface Stats {
  totalViews: number;
  totalGifts: number;
  totalLikes: number;
  peakViewers: number;
  currentViewers: number;
}

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
};

const defaultStats: Stats = {
  totalViews: 0,
  totalGifts: 0,
  totalLikes: 0,
  peakViewers: 0,
  currentViewers: 0,
};

export function useOverlayStore() {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [gifts, setGifts] = useState<GiftEvent[]>([]);
  const [joins, setJoins] = useState<ViewerJoinEvent[]>([]);
  const [settings, setSettings] = useState<OverlaySettings>(defaultSettings);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [isConnected, setIsConnected] = useState(false);

  const addChat = useCallback((msg: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setChats((prev) => [...prev.slice(-29), newMsg]);
  }, []);

  const addGift = useCallback((gift: Omit<GiftEvent, "id" | "timestamp">) => {
    const newGift: GiftEvent = {
      ...gift,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setGifts((prev) => [...prev.slice(-19), newGift]);
    setStats((prev) => ({ ...prev, totalGifts: prev.totalGifts + gift.giftCount }));
  }, []);

  const addJoin = useCallback((join: Omit<ViewerJoinEvent, "id" | "timestamp">) => {
    const newJoin: ViewerJoinEvent = {
      ...join,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setJoins((prev) => [...prev.slice(-9), newJoin]);
    setStats((prev) => ({
      ...prev,
      totalViews: prev.totalViews + 1,
      currentViewers: prev.currentViewers + 1,
      peakViewers: Math.max(prev.peakViewers, prev.currentViewers + 1),
    }));
  }, []);

  const updateSettings = useCallback((partial: Partial<OverlaySettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const addLike = useCallback(() => {
    setStats((prev) => ({ ...prev, totalLikes: prev.totalLikes + 1 }));
  }, []);

  return {
    chats, gifts, joins, settings, stats, isConnected,
    addChat, addGift, addJoin, updateSettings, addLike,
    setIsConnected, setStats,
  };
}
