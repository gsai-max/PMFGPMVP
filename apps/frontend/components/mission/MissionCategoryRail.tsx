'use client';

import React from 'react';
import { Sparkles, Layers, CheckCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { MISSION_CLUSTER_MAP } from '../../lib/missionClusters';

export const MissionCategoryRail: React.FC = () => {
  const { selectedMissionKey, detectedMission, activeSubcategoryFilter, setSubcategoryFilter } = useCartStore();

  const activeMissionKey = selectedMissionKey || detectedMission?.mission || 'breakfast';
  const config = MISSION_CLUSTER_MAP[activeMissionKey] || MISSION_CLUSTER_MAP.breakfast;

  return (
    <section className="bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-700/50 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="bg-yellow-400 text-black font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 fill-black" />
            MISSION → SUBCATEGORY → PRODUCT CLUSTERING
          </span>
          <h2 className="text-xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Clustered Categories for {config.displayName}
          </h2>
        </div>
        <p className="text-xs text-emerald-200 font-medium">
          Includes Core Staples & Mission Gap Adjacent Candidates
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {config.clusters.map((sub) => {
          const isActive = activeSubcategoryFilter === sub.searchQuery || activeSubcategoryFilter === sub.name;
          return (
            <button
              key={sub.id}
              onClick={() => setSubcategoryFilter(sub.searchQuery || sub.name)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all transform active:scale-95 border ${
                isActive
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg scale-105 ring-2 ring-yellow-400/50'
                  : sub.isAdjacent
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40 backdrop-blur-md'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15 backdrop-blur-md'
              }`}
            >
              <span className="text-base">{sub.icon}</span>
              <span>{sub.name}</span>
              {sub.isAdjacent && !isActive && (
                <span className="bg-amber-400 text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded-md uppercase">
                  GAP CANDIDATE
                </span>
              )}
              {isActive && <CheckCircle className="w-3.5 h-3.5 fill-black text-yellow-400 ml-1" />}
            </button>
          );
        })}
      </div>
    </section>
  );
};
