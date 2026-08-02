'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import { ProductCard } from '../ui/ProductCard';

export const MissionRecommendationRail: React.FC = () => {
  const { detectedMission, cartId } = useCartStore();
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const missionKey = detectedMission?.mission || undefined;
    api
      .get('/mission/recommendations', { params: { mission: missionKey, cartId } })
      .then((res) => setRecommendations(res.data))
      .catch(console.error);
  }, [detectedMission, cartId]);

  if (!recommendations || recommendations.length === 0) return null;

  const title = detectedMission?.mission
    ? `Recommended for your ${detectedMission.displayName}`
    : 'Frequently Bought Together';

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-blinkit-green uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-blinkit-green" />
            Mission-Aware Discovery
          </span>
          <h2 className="text-xl font-black text-gray-900">{title}</h2>
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
