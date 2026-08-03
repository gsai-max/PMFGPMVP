'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Zap, Coffee, Utensils, ShoppingCart, Film, Users, Baby, Dog, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../lib/mockData';
import { ProductCard } from '../components/ui/ProductCard';
import { MissionBanner } from '../components/mission/MissionBanner';
import { MissionRecommendationRail } from '../components/mission/MissionRecommendationRail';
import { useCartStore } from '../store/cartStore';

const QUICK_MISSIONS = [
  { key: 'breakfast', name: 'Breakfast Prep', icon: Coffee, bg: 'bg-amber-500', sampleQuery: 'milk' },
  { key: 'dinner_prep', name: 'Dinner Cooking', icon: Utensils, bg: 'bg-emerald-600', sampleQuery: 'atta' },
  { key: 'monthly_grocery', name: 'Monthly Restock', icon: ShoppingCart, bg: 'bg-blue-600', sampleQuery: 'rice' },
  { key: 'movie_night', name: 'Movie Night', icon: Film, bg: 'bg-purple-600', sampleQuery: 'chips' },
  { key: 'guest_arrival', name: 'Hosting Guests', icon: Users, bg: 'bg-orange-500', sampleQuery: 'coca-cola' },
  { key: 'baby_care', name: 'Baby Care', icon: Baby, bg: 'bg-pink-500', sampleQuery: 'diapers' },
  { key: 'pet_care', name: 'Pet Care', icon: Dog, bg: 'bg-yellow-600', sampleQuery: 'pedigree' },
];

export default function HomePage() {
  // Initialize state with rich mock data so SSR/hydration renders full catalog immediately
  const [featuredProducts, setFeaturedProducts] = useState<any[]>(MOCK_PRODUCTS.slice(0, 12));
  const [categories, setCategories] = useState<any[]>(MOCK_CATEGORIES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addItem, toggleCart } = useCartStore();

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=12'),
      api.get('/categories'),
    ])
      .then(([prodRes, catRes]) => {
        if (prodRes.data?.products && prodRes.data.products.length > 0) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (catRes.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
      })
      .catch(console.error);
  }, []);

  const triggerMissionDemo = async (missionName: string, query: string) => {
    try {
      const res = await api.get(`/products?q=${encodeURIComponent(query)}`);
      const prod = res.data.products?.[0] || MOCK_PRODUCTS[0];
      if (prod) {
        await addItem(prod.id, 1);
        setToastMessage(`Added ${prod.name} for ${missionName}! AI Mission Intent active.`);
        setTimeout(() => setToastMessage(null), 4000);
        toggleCart(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-blinkit-green shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top AI Mission Intelligence Active Banner */}
      <MissionBanner />

      {/* Hero Quick Mission Preset Selector */}
      <section className="bg-gradient-to-r from-green-900 via-emerald-800 to-green-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-yellow-400 text-black font-black text-xs uppercase px-3 py-1 rounded-full inline-flex items-center gap-1 mb-3 shadow-md">
            <Zap className="w-3.5 h-3.5 fill-black" />
            10-Minute Instant Mission Delivery
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-3">
            What's your shopping mission today?
          </h1>
          <p className="text-green-100 text-sm mb-6 font-medium">
            Click any mission preset below. BlinkClone detects your intent in real-time and builds a 1-tap completion checklist!
          </p>

          {/* Quick Mission Buttons */}
          <div className="flex flex-wrap gap-2.5">
            {QUICK_MISSIONS.map((m) => {
              const IconComp = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => triggerMissionDemo(m.name, m.sampleQuery)}
                  className="bg-white/10 hover:bg-white/25 border border-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition backdrop-blur-md active:scale-95 shadow-sm"
                >
                  <span className={`w-5 h-5 rounded-md ${m.bg} flex items-center justify-center text-white shrink-0`}>
                    <IconComp className="w-3 h-3" />
                  </span>
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <Sparkles className="w-96 h-96 text-white" />
        </div>
      </section>

      {/* Mission Recommendation Rail */}
      <MissionRecommendationRail />

      {/* Category Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900">Browse Categories</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-lg transition group"
            >
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                {cat.icon || '🛒'}
              </span>
              <span className="font-extrabold text-xs text-gray-900 group-hover:text-blinkit-green transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Products Carousel / Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">Trending Essentials</h2>
            <p className="text-xs text-gray-500 font-medium">Delivered hot & fresh to your doorstep in 10 mins</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

    </div>
  );
}
