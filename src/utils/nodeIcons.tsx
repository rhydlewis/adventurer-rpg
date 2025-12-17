import {
  Sword,
  Shield,
  Skull,
  AlertTriangle,
  MessageCircle,
  Volume2,
  HelpCircle,
  AlertCircle,
  Map,
  Compass,
  Search,
  MapPin,
  Gem,
  Trophy,
  XCircle,
  Gift,
  Sparkles,
  AlertOctagon,
  Wand2,
  Crown,
} from 'lucide-react';
import type { NodeIcon } from '../types';

/**
 * Maps NodeIcon string values to Lucide React icon components
 */
export const ICON_MAP: Record<NodeIcon, React.ComponentType<{ className?: string }>> = {
  // Combat
  sword: Sword,
  shield: Shield,
  skull: Skull,
  danger: AlertTriangle,

  // Social
  dialogue: MessageCircle,
  speech: Volume2,
  question: HelpCircle,
  exclamation: AlertCircle,

  // Exploration
  map: Map,
  compass: Compass,
  search: Search,
  location: MapPin,

  // Outcomes
  treasure: Gem,
  victory: Trophy,
  defeat: XCircle,
  reward: Gift,

  // Atmosphere
  mystery: Sparkles,
  warning: AlertOctagon,
  magic: Wand2,
  crown: Crown,
};

/**
 * Get the icon component for a NodeIcon name
 */
export function getNodeIconComponent(
  icon: NodeIcon | undefined
): React.ComponentType<{ className?: string }> | null {
  if (!icon) return null;
  return ICON_MAP[icon] ?? null;
}
