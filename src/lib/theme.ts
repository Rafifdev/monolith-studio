export function hexToHsl(hex: string): string {
  // Parse hex
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export type ThemeTemplate = "brutal" | "neon" | "cyber" | "matrix" | "blood" | "aurora" | "custom";
export type ThemeMode = "light" | "dark";

export const THEME_PRESETS: Record<Exclude<ThemeTemplate, "custom">, { hex: string, name: string, secondaryHex: string, accentHex: string }> = {
  brutal: { hex: "#ffcc00", name: "Brutal (Yellow)",  secondaryHex: "#ff4444", accentHex: "#00ccff" },
  neon:   { hex: "#ff007f", name: "Neon (Pink)",       secondaryHex: "#ff6600", accentHex: "#cc00ff" },
  cyber:  { hex: "#00ffff", name: "Cyber (Cyan)",      secondaryHex: "#0055ff", accentHex: "#ff00aa" },
  matrix: { hex: "#00ff00", name: "Matrix (Green)",    secondaryHex: "#00cc44", accentHex: "#44ff88" },
  blood:  { hex: "#ff0000", name: "Blood (Red)",       secondaryHex: "#cc2200", accentHex: "#ff6600" },
  aurora: { hex: "#f15bb5", name: "Aurora (Multi)",    secondaryHex: "#00bbf9", accentHex: "#fee440" },
};

// Special per-card colors for the Aurora theme
export const AURORA_CARD_COLORS = [
  "#ff2d78",  // Total Views  — hot pink
  "#00f5d4",  // Total Gifts  — electric mint
  "#fee440",  // Total Likes  — vivid yellow
  "#9b5de5",  // Peak Viewers — electric purple
];

/** Generate 4 vivid colors spaced 90° apart on the hue wheel (randomized starting point) */
export function generateAuroraColors(): string[] {
  const startHue = Math.floor(Math.random() * 360);
  const sat = 90 + Math.floor(Math.random() * 10); // 90-100% saturation
  const lit = 52 + Math.floor(Math.random() * 10); // 52-62% lightness
  return [
    `hsl(${startHue % 360}, ${sat}%, ${lit}%)`,
    `hsl(${(startHue + 90) % 360}, ${sat}%, ${lit}%)`,
    `hsl(${(startHue + 180) % 360}, ${sat}%, ${lit}%)`,
    `hsl(${(startHue + 270) % 360}, ${sat}%, ${lit}%)`,
  ];
}

/** Returns concrete hex color values for the current theme settings */
export function getThemeColors(template: ThemeTemplate, customHex: string = "#9b00ff", auroraColors?: string[]) {
  if (template === "custom") {
    const hsl = hexToHsl(customHex).split(" ");
    const h = parseFloat(hsl[0]);
    const s1 = (h + 120) % 360;
    const s2 = (h + 240) % 360;
    return {
      primary:   customHex,
      secondary: `hsl(${s1}, 100%, 55%)`,
      accent:    `hsl(${s2}, 100%, 50%)`,
      cardColors: null as string[] | null,
    };
  }
  if (template === "aurora") {
    const colors = auroraColors && auroraColors.length === 4 ? auroraColors : AURORA_CARD_COLORS;
    const p = THEME_PRESETS.aurora;
    return {
      primary:   colors[0],
      secondary: colors[1],
      accent:    colors[2],
      cardColors: colors,
    };
  }
  const p = THEME_PRESETS[template];
  return { primary: p.hex, secondary: p.secondaryHex, accent: p.accentHex, cardColors: null as string[] | null };
}

export function applyTheme(mode: ThemeMode, template: ThemeTemplate, customHex: string = "#9b00ff", auroraColors?: string[]) {
  const root = document.documentElement;

  // 1. Determine foreground color (for shadows) based on mode
  const fgHsl = mode === "dark" ? "60 20% 92%" : "60 5% 6%";

  // 2. Primary Color — custom defaults to vivid purple if user hasn't picked yet
  let primaryHex = template === "custom" ? customHex : THEME_PRESETS[template]?.hex;
  if (!primaryHex) primaryHex = THEME_PRESETS.brutal.hex;

  // 3. Secondary & Accent
  if (template === "custom") {
    const parts = hexToHsl(customHex).split(" ");
    const h = parseFloat(parts[0]);
    root.style.setProperty("--secondary", `${(h + 120) % 360} 100% 55%`);
    root.style.setProperty("--accent",    `${(h + 240) % 360} 100% 50%`);
    root.style.setProperty("--brutal-shadow-accent", `4px 4px 0px hsl(${(h + 240) % 360} 100% 50%)`);
  } else if (template === "aurora" && auroraColors && auroraColors.length === 4) {
    // When aurora is active, use the first 3 random colors for the theme vars
    const c1 = auroraColors[0].includes("hsl") ? auroraColors[0].replace("hsl(", "").replace(")", "") : hexToHsl(auroraColors[0]);
    const c2 = auroraColors[1].includes("hsl") ? auroraColors[1].replace("hsl(", "").replace(")", "") : hexToHsl(auroraColors[1]);
    const c3 = auroraColors[2].includes("hsl") ? auroraColors[2].replace("hsl(", "").replace(")", "") : hexToHsl(auroraColors[2]);
    
    root.style.setProperty("--primary", c1);
    root.style.setProperty("--secondary", c2);
    root.style.setProperty("--accent", c3);
    root.style.setProperty("--brutal-shadow-primary", `4px 4px 0px hsl(${c1})`);
    root.style.setProperty("--brutal-shadow-accent", `4px 4px 0px hsl(${c3})`);
    root.style.setProperty("--ring", c1);
    // Skip further setting of primary as we did it here
  } else {
    const secondaryHsl = hexToHsl(THEME_PRESETS[template].secondaryHex);
    const accentHsl    = hexToHsl(THEME_PRESETS[template].accentHex);
    root.style.setProperty("--secondary", secondaryHsl);
    root.style.setProperty("--accent",    accentHsl);
    root.style.setProperty("--brutal-shadow-accent", `4px 4px 0px hsl(${accentHsl})`);
  }

  // Set primary for non-aurora cases (aurora has already set its vars above)
  if (template !== "aurora" || !auroraColors) {
    const primaryHsl = hexToHsl(primaryHex);
    root.style.setProperty("--primary", primaryHsl);
    root.style.setProperty("--ring", primaryHsl);
    root.style.setProperty("--brutal-shadow-primary", `4px 4px 0px hsl(${primaryHsl})`);
  }
  root.style.setProperty("--brutal-shadow",         `4px 4px 0px hsl(${fgHsl})`);
  root.style.setProperty("--secondary-foreground", "60 20% 92%");
  root.style.setProperty("--accent-foreground", "60 5% 6%");

  // 4. Background / Foreground Modes
  if (mode === "dark") {
    root.style.setProperty("--background", "60 5% 6%");
    root.style.setProperty("--foreground", fgHsl);
    root.style.setProperty("--card", "60 4% 10%");
    root.style.setProperty("--card-foreground", fgHsl);
    root.style.setProperty("--muted", "60 3% 16%");
    root.style.setProperty("--muted-foreground", "60 5% 55%");
    root.style.setProperty("--border", "60 5% 22%");
    root.style.setProperty("--primary-foreground", "60 5% 6%");
  } else {
    root.style.setProperty("--background", "60 20% 92%");
    root.style.setProperty("--foreground", fgHsl);
    root.style.setProperty("--card", "0 0% 100%");
    root.style.setProperty("--card-foreground", fgHsl);
    root.style.setProperty("--muted", "60 5% 85%");
    root.style.setProperty("--muted-foreground", "60 5% 35%");
    root.style.setProperty("--border", "60 5% 15%");
    root.style.setProperty("--primary-foreground", "60 5% 6%");
  }
}

