'use client';

import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

export const MissionBanner: React.FC = () => {
  const { detectedMission } = useCartStore();

  if (!detectedMission || !detectedMission.mission || detectedMission.confidence < 0.4) {
    return null;
  }

  const confidencePercent = Math.round(detectedMission.confidence * 100);

  return (
    <div className="bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse-glow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-xl shadow-inner">
          {detectedMission.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-black text-amber-300 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              AI Mission Intelligence
            </span>
            <span className="text-xs font-bold text-amber-900">
              {confidencePercent}% Confidence
            </span>
          </div>
          <h2 className="text-base font-black text-gray-900 mt-0.5">
            Looks like you're shopping for <span className="text-blinkit-darkGreen underline decoration-wavy decoration-amber-500">{detectedMission.displayName}</span>
          </h2>
        </div>
      </div>

      {detectedMission.matchedSignals.length > 0 && (
        <div className="text-xs text-amber-800/90 bg-white/60 px-3 py-1.5 rounded-lg border border-amber-200/60 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>{detectedMission.matchedSignals[0]}</span>
        </div>
      )}
    </div>
  );
};
