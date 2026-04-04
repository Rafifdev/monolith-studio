import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: "primary" | "secondary" | "accent";
}

const colorMap = {
  primary: "border-primary",
  secondary: "border-secondary",
  accent: "border-accent",
};

export function StatCard({ label, value, icon, color = "primary" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`brutal-card border-l-[6px] ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="stat-number text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</div>
    </motion.div>
  );
}
