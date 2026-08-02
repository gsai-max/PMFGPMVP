'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { ProductCard } from '../../components/ui/ProductCard';
import { MissionBanner } from '../../components/mission/MissionBanner';
import { useCartStore } from '../../store/cartStore';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshMissionData } = useCartStore();

  useEffect(() => {
    if (!query) return;
    setLoading(true);

    // Log search event for mission intelligence signal engine
    api.post('/events/log', {
      eventType: 'SEARCH',
      payload: { query },
    }).catch(console.error);

    api.get(`/products?q=${encodeURIComponent(query)}`).then((res) => {
      setProducts(res.data.products);
      setLoading(false);
      refreshMissionData();
    }).catch(console.error);
  }, [query, refreshMissionData]);

  return (
    <div className="space-y-6">
      <MissionBanner />

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900">
            Search results for <span className="text-blinkit-green">"{query}"</span>
          </h1>
          <p className="text-xs text-gray-500">{products.length} matching items found</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-semibold">Searching catalog...</div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-gray-500 font-bold bg-white rounded-2xl border border-gray-100">
          No products matched your search "{query}". Try searching for milk, bread, eggs, or chips!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400 font-semibold">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

