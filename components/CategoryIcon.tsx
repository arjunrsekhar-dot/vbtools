import {
  ChartNoAxesCombined, Code2, LayoutTemplate, Megaphone,
  Palette, Sparkles, Users, Zap
} from "lucide-react";

const icons = { ChartNoAxesCombined, Code2, LayoutTemplate, Megaphone, Palette, Sparkles, Users, Zap };

export function CategoryIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons] ?? Sparkles;
  return <Icon size={size} strokeWidth={1.8} />;
}
