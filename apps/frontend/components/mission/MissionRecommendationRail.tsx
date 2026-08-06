'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { MOCK_PRODUCTS } from '../../lib/mockData';
import { findClusterByFilter } from '../../lib/missionClusters';
import { useCartStore } from '../../store/cartStore';
import { ProductCard } from '../ui/ProductCard';

function getFallbackRecommendations(missionKey: string, filterValue?: string | null) {
  if (filterValue) {
    const matchedCluster = findClusterByFilter(missionKey, filterValue);
    if (matchedCluster) {
      const clusterSubs = matchedCluster.catalogSubcategories.map((s) => s.toLowerCase());
      const examples = matchedCluster.productExamples.map((e) => e.toLowerCase());

      const matched = MOCK_PRODUCTS.filter((p) => {
        const pSub = (p.subcategory || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        const pDesc = (p.description || '').toLowerCase();

        // 1. Strict match on catalog subcategories
        if (clusterSubs.some((sub) => pSub.includes(sub) || sub.includes(pSub))) return true;

        // 2. Match specific product example keywords (excluding generic short words)
        if (examples.some((ex) => ex.length > 2 && (pName.includes(ex) || pDesc.includes(ex)))) return true;

        return false;
      });

      if (matched.length > 0) return matched;
    }

    // Direct search query match ONLY if no cluster was matched
    const q = filterValue.toLowerCase();
    const directMatch = MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
    if (directMatch.length > 0) return directMatch;
  }

  const missionMatched = MOCK_PRODUCTS.filter((p) => p.missionTags?.includes(missionKey));
  return missionMatched.length > 0 ? missionMatched : MOCK_PRODUCTS.slice(0, 6);
}

export const MissionRecommendationRail: React.FC = () => {
  const { detectedMission, selectedMissionKey, activeSubcategoryFilter, cartId } = useCartStore();
  const [recommendations, setRecommendations] = useState<any[]>(MOCK_PRODUCTS.slice(0, 6));

  const activeMissionKey = selectedMissionKey || detectedMission?.mission || 'breakfast';

  useEffect(() => {
    let url = `/mission/recommendations?mission=${activeMissionKey}`;
    if (cartId) url += `&cartId=${cartId}`;
    if (activeSubcategoryFilter) url += `&q=${encodeURIComponent(activeSubcategoryFilter)}`;

    api
      .get(url)
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setRecommendations(res.data);
        } else {
          setRecommendations(getFallbackRecommendations(activeMissionKey, activeSubcategoryFilter));
        }
      })
      .catch(() => {
        setRecommendations(getFallbackRecommendations(activeMissionKey, activeSubcategoryFilter));
      });
  }, [activeMissionKey, activeSubcategoryFilter, cartId]);

  if (!recommendations || recommendations.length === 0) return null;

  const missionName = selectedMissionKey 
    ? selectedMissionKey.replace('_', ' ').toUpperCase()
    : (detectedMission?.displayName || 'Breakfast Prep');

  const clusterObj = activeSubcategoryFilter ? findClusterByFilter(activeMissionKey, activeSubcategoryFilter) : null;
  const filterLabel = clusterObj ? clusterObj.name : activeSubcategoryFilter;

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit mb-1">
            <Sparkles className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
            AI MISSION RE-RANKING ACTIVE
          </span>
          <h2 className="text-xl font-black text-gray-900">
            {activeSubcategoryFilter 
              ? `Items for "${filterLabel}" in ${missionName}` 
              : `AI Recommended for your ${missionName}`}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recommendations.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </section>
  );
};
