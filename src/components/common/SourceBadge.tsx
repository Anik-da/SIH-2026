import React from 'react';
import type { SourceBadgeType } from '../../types/cadastral';
import { ShieldCheck, Cpu, Upload, Tag, AlertTriangle } from 'lucide-react';

interface Props {
  badge?: SourceBadgeType | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  customText?: string;
}

export const SourceBadge: React.FC<Props> = ({
  badge = 'DEMO',
  size = 'md',
  showLabel = true,
  customText,
}) => {
  const normalizedBadge = (badge as string).toUpperCase();

  let bgClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  let Icon = Tag;
  let text = customText || 'DEMO';

  if (normalizedBadge.includes('OFFICIAL') || normalizedBadge.includes('AUTHORIZED')) {
    bgClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    Icon = ShieldCheck;
    text = customText || 'OFFICIAL / AUTHORIZED';
  } else if (normalizedBadge.includes('DERIVED')) {
    bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    Icon = Cpu;
    text = customText || 'DERIVED';
  } else if (normalizedBadge.includes('IMPORTED') || normalizedBadge.includes('USER')) {
    bgClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    Icon = Upload;
    text = customText || 'USER IMPORTED';
  } else if (normalizedBadge.includes('UNVERIFIED') || normalizedBadge.includes('WARNING')) {
    bgClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    Icon = AlertTriangle;
    text = customText || 'UNVERIFIED';
  } else {
    bgClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    Icon = Tag;
    text = customText || 'DEMO';
  }

  const sizeClass =
    size === 'sm'
      ? 'px-1.5 py-0.5 text-[9px] gap-1'
      : size === 'lg'
      ? 'px-3 py-1 text-xs gap-1.5'
      : 'px-2 py-0.5 text-[10px] gap-1';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-md border tracking-wider uppercase backdrop-blur-sm transition-all ${bgClass} ${sizeClass}`}
      title={`Data Source Status: ${text}`}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      {showLabel && <span>{text}</span>}
    </span>
  );
};
