import type { NodeTone } from '../types';

/**
 * Tailwind CSS classes for each tone
 * Applied to node containers for visual emphasis
 */
export const TONE_STYLES: Record<NodeTone, string> = {
  calm: 'border-blue-300 bg-blue-50',
  tense: 'border-orange-400 bg-orange-50',
  mysterious: 'border-purple-400 bg-purple-50',
  danger: 'border-red-500 bg-red-50',
  triumphant: 'border-green-400 bg-green-50',
  urgent: 'border-red-600 bg-red-100 animate-pulse',
};

/**
 * Get Tailwind classes for a tone (or empty string if none)
 */
export function getToneStyles(tone: NodeTone | undefined): string {
  if (!tone) return '';
  return TONE_STYLES[tone] ?? '';
}
