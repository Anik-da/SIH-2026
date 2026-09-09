import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ArrivalNotificationProps {
  floorName: string;
  show: boolean;
}

export function ArrivalNotification({ floorName, show }: ArrivalNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(t);
    }
  }, [show, floorName]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/4 z-20 -translate-x-1/2 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-400/40 bg-slate-900/90 px-6 py-4 backdrop-blur-md shadow-2xl">
        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        <div>
          <div className="text-[10px] tracking-wider text-emerald-400">ARRIVED</div>
          <div className="text-lg font-bold text-white">{floorName}</div>
        </div>
      </div>
    </div>
  );
}
