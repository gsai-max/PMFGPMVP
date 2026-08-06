'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Zap, Layers, Target, ChevronUp, ChevronDown } from 'lucide-react';

export const AIMissionGuideBanner: React.FC = () => {
  const [showAIGuide, setShowAIGuide] = useState<boolean>(true);

  return (
    <div className="bg-[#0b0c1e] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-[#1d2242] transition-all">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setShowAIGuide(!showAIGuide)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#171a36] border border-[#2b305b] flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-yellow-400 text-black font-black text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-sm">
                <Sparkles className="w-3 h-3 fill-black text-black" />
                NEW FEATURE
              </span>
              <span className="text-xs font-bold text-indigo-200/90">AI Mission Intelligence Platform</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight mt-0.5">
              How AI Mission Shopping Works
            </h3>
          </div>
        </div>
        <button 
          className="text-indigo-300/80 hover:text-white p-1 transition-colors"
          aria-label={showAIGuide ? "Collapse guide" : "Expand guide"}
        >
          {showAIGuide ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {showAIGuide && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1d2242]">
          {/* Card 1 */}
          <div className="bg-[#13162e] p-3.5 rounded-2xl border border-[#21264c] flex items-start gap-3 transition-all hover:border-indigo-500/40 hover:bg-[#161a36]">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white tracking-wide">1. Mission Intent Detection</div>
              <div className="text-[11px] text-gray-300/90 mt-1 leading-relaxed">
                Infers your meal or goal (e.g. Breakfast) from cart signals, search, & time of day.
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#13162e] p-3.5 rounded-2xl border border-[#21264c] flex items-start gap-3 transition-all hover:border-indigo-500/40 hover:bg-[#161a36]">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white tracking-wide">2. Mission Subcategory Clustering</div>
              <div className="text-[11px] text-gray-300/90 mt-1 leading-relaxed">
                Aggregates Dosa Batter, Milk, Eggs, Oats, & Juices in 1 tap without cross-category navigation.
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#13162e] p-3.5 rounded-2xl border border-[#21264c] flex items-start gap-3 transition-all hover:border-indigo-500/40 hover:bg-[#161a36]">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white tracking-wide">3. Mission Checklist Assistant</div>
              <div className="text-[11px] text-gray-300/90 mt-1 leading-relaxed">
                Displays live completion % and 1-tap add suggestions inside your cart.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
