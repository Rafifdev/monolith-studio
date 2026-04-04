import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: string; // explicit hex / hsl / css color string
}

export function StatCard({ label, value, icon, color = "#ffcc00" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="brutal-card border-l-[6px]"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-number" style={{ color }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
    </motion.div>
  );
}


