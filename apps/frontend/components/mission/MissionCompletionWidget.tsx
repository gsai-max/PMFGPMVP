'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle2, Plus, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

export const MissionCompletionWidget: React.FC = () => {
  const { missionCompletion, addItem } = useCartStore();

  if (!missionCompletion || !missionCompletion.mission) return null;

  const { mission, completionPercentage, suggestedItems } = missionCompletion;

  return (
    <div className="bg-gradient-to-br from-green-900 to-emerald-950 text-white rounded-2xl p-4 my-4 shadow-xl border border-green-700/50">
      
      {/* Header & Progress Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{mission.icon || '🎯'}</span>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              {mission.displayName} Checklist
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            </h3>
            <p className="text-[11px] text-green-200">
              {completionPercentage === 100 ? 'Mission Complete! Cart fully stocked.' : `${completionPercentage}% complete — add missing items below`}
            </p>
          </div>
        </div>
        <span className="text-lg font-black text-yellow-400">{completionPercentage}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-green-950/80 rounded-full h-2.5 overflow-hidden mb-3 p-0.5 border border-green-700/40">
        <div
          className="bg-gradient-to-r from-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-lg"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Suggested 1-Tap Add Chips */}
      {suggestedItems && suggestedItems.length > 0 && (
        <div className="mt-3 border-t border-green-800/80 pt-3">
          <div className="text-[11px] font-bold text-green-300 uppercase tracking-wider mb-2 flex items-center gap-1">
            Missing items to complete your mission:
          </div>
          <div className="flex flex-col gap-2">
            {suggestedItems.map((prod: any) => (
              <div
                key={prod.id}
                className="flex items-center justify-between bg-white/10 hover:bg-white/15 backdrop-blur-md p-2 rounded-xl border border-white/10 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white/20 shrink-0">
                    <Image
                      src={prod.imageUrl}
                      alt={prod.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-white line-clamp-1">{prod.name}</h4>
                    <span className="text-[11px] text-green-300 font-bold">₹{prod.price} • {prod.unit}</span>
                  </div>
                </div>

                <button
                  onClick={() => addItem(prod.id, 1)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow transition active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  ADD
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {completionPercentage === 100 && (
        <div className="flex items-center gap-2 text-xs text-yellow-300 font-bold mt-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          You have all essential items for this mission in your cart!
        </div>
      )}
    </div>
  );
};
