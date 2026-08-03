'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { MOCK_PRODUCTS } from '../../lib/mockData';
import { useCartStore } from '../../store/cartStore';
import { ProductCard } from '../ui/ProductCard';

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
          // Fallback mock filtering
          let filtered = MOCK_PRODUCTS.filter((p) => p.missionTags?.includes(activeMissionKey));
          if (activeSubcategoryFilter) {
            filtered = MOCK_PRODUCTS.filter((p) => 
              p.name.toLowerCase().includes(activeSubcategoryFilter.toLowerCase()) ||
              p.subcategory?.toLowerCase().includes(activeSubcategoryFilter.toLowerCase())
            );
          }
          setRecommendations(filtered.length > 0 ? filtered : MOCK_PRODUCTS.slice(0, 6));
        }
      })
      .catch(() => {
        let filtered = MOCK_PRODUCTS.filter((p) => p.missionTags?.includes(activeMissionKey));
        if (activeSubcategoryFilter) {
          filtered = MOCK_PRODUCTS.filter((p) => 
            p.name.toLowerCase().includes(activeSubcategoryFilter.toLowerCase()) ||
            p.subcategory?.toLowerCase().includes(activeSubcategoryFilter.toLowerCase())
          );
        }
        setRecommendations(filtered.length > 0 ? filtered : MOCK_PRODUCTS.slice(0, 6));
      });
  }, [activeMissionKey, activeSubcategoryFilter, cartId]);

  if (!recommendations || recommendations.length === 0) return null;

  const missionName = selectedMissionKey 
    ? selectedMissionKey.replace('_', ' ').toUpperCase()
    : (detectedMission?.displayName || 'Breakfast Prep');

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
              ? `Items for "${activeSubcategoryFilter}" in ${missionName}` 
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
