'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, Coffee, Utensils, ShoppingCart, Film, Users, Baby, Dog } from 'lucide-react';
import { api } from '../lib/api';
import { ProductCard } from '../components/ui/ProductCard';
import { MissionBanner } from '../components/mission/MissionBanner';
import { MissionRecommendationRail } from '../components/mission/MissionRecommendationRail';
import { useCartStore } from '../store/cartStore';

const QUICK_MISSIONS = [
  { key: 'breakfast', name: 'Breakfast Prep', icon: Coffee, bg: 'bg-amber-500' },
  { key: 'dinner_prep', name: 'Dinner Cooking', icon: Utensils, bg: 'bg-emerald-600' },
  { key: 'monthly_grocery', name: 'Monthly Restock', icon: ShoppingCart, bg: 'bg-blue-600' },
  { key: 'movie_night', name: 'Movie Night', icon: Film, bg: 'bg-purple-600' },
  { key: 'guest_arrival', name: 'Hosting Guests', icon: Users, bg: 'bg-orange-500' },
  { key: 'baby_care', name: 'Baby Essentials', icon: Baby, bg: 'bg-pink-500' },
  { key: 'pet_care', name: 'Pet Care', icon: Dog, bg: 'bg-yellow-600' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { addItem, refreshMissionData } = useCartStore();

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=12'),
      api.get('/categories'),
    ])
      .then(([prodRes, catRes]) => {
        setFeaturedProducts(prodRes.data.products);
        setCategories(catRes.data);
      })
      .catch(console.error);
  }, []);

  const triggerMissionDemo = (missionKey: string) => {
    // Add representative seed item for instant mission detection demonstration
    if (missionKey === 'breakfast') {
      api.get('/products?q=milk').then((res) => {
        if (res.data.products?.[0]) addItem(res.data.products[0].id, 1);
      });
    } else if (missionKey === 'dinner_prep') {
      api.get('/products?q=atta').then((res) => {
        if (res.data.products?.[0]) addItem(res.data.products[0].id, 1);
      });
    } else if (missionKey === 'movie_night') {
      api.get('/products?q=chips').then((res) => {
        if (res.data.products?.[0]) addItem(res.data.products[0].id, 1);
      });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top AI Mission Intelligence Active Banner */}
      <MissionBanner />

      {/* Hero Quick Mission Preset Selector */}
      <section className="bg-gradient-to-r from-green-900 via-emerald-800 to-green-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-yellow-400 text-black font-black text-xs uppercase px-3 py-1 rounded-full inline-flex items-center gap-1 mb-3">
            <Zap className="w-3.5 h-3.5 fill-black" />
            10-Minute Instant Mission Delivery
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-3">
            What's your shopping mission today?
          </h1>
          <p className="text-green-100 text-sm mb-6">
            BlinkClone detects your shopping intent in real-time, completing your cart with essential complementary items.
          </p>

          {/* Quick Mission Buttons */}
          <div className="flex flex-wrap gap-2.5">
            {QUICK_MISSIONS.map((m) => {
              const IconComp = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => triggerMissionDemo(m.key)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition backdrop-blur-md active:scale-95"
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
              className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-md transition group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🛒</span>
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
            <p className="text-xs text-gray-500">Delivered hot & fresh to your doorstep</p>
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
