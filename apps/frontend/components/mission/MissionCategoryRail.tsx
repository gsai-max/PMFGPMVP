'use client';

import React from 'react';
import { Sparkles, Layers, CheckCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

interface MissionCategoryConfig {
  displayName: string;
  subcategories: Array<{ id: string; name: string; icon: string; query?: string }>;
}

const MISSION_CATEGORIES: Record<string, MissionCategoryConfig> = {
  breakfast: {
    displayName: 'Breakfast Prep',
    subcategories: [
      { id: 'dosa_batter', name: 'Dosa & Idli Batter', icon: '🥞', query: 'batter' },
      { id: 'milk_dairy', name: 'Fresh Milk & Curd', icon: '🥛', query: 'milk' },
      { id: 'eggs', name: 'Eggs & Omelet', icon: '🍳', query: 'eggs' },
      { id: 'oats_muesli', name: 'Oats & Muesli', icon: '🥣', query: 'oats' },
      { id: 'protein_powder', name: 'Protein & Health', icon: '🏋️', query: 'protein' },
      { id: 'fresh_fruits', name: 'Fresh Fruits', icon: '🍌', query: 'banana' },
      { id: 'juices', name: 'Juices & Smoothies', icon: '🥤', query: 'juice' },
      { id: 'bread', name: 'Bread & Spreads', icon: '🍞', query: 'bread' },
    ],
  },
  dinner_prep: {
    displayName: 'Dinner Cooking',
    subcategories: [
      { id: 'atta_flours', name: 'Atta & Flours', icon: '🌾', query: 'atta' },
      { id: 'dal_pulses', name: 'Dal & Pulses', icon: '🫘', query: 'dal' },
      { id: 'oils_ghee', name: 'Oils & Ghee', icon: '🫕', query: 'oil' },
      { id: 'veggies', name: 'Fresh Vegetables', icon: '🧅', query: 'onion' },
      { id: 'masalas', name: 'Spices & Masalas', icon: '🌶️', query: 'masala' },
    ],
  },
  movie_night: {
    displayName: 'Movie Night',
    subcategories: [
      { id: 'chips', name: 'Chips & Namkeen', icon: '🍿', query: 'chips' },
      { id: 'chocolates', name: 'Chocolates & Sweets', icon: '🍫', query: 'chocolate' },
      { id: 'cold_drinks', name: 'Cold Drinks & Sodas', icon: '🥤', query: 'coca-cola' },
      { id: 'frozen_snacks', name: 'Frozen Snacks', icon: '🍟', query: 'fries' },
    ],
  },
  monthly_grocery: {
    displayName: 'Monthly Restock',
    subcategories: [
      { id: 'rice_atta', name: 'Rice & Atta', icon: '🌾', query: 'rice' },
      { id: 'cleaning', name: 'Cleaning Essentials', icon: '🧼', query: 'detergent' },
      { id: 'personal_care', name: 'Personal Care', icon: '🧴', query: 'soap' },
      { id: 'dairy_restock', name: 'Daily Dairy', icon: '🥛', query: 'milk' },
    ],
  },
  guest_arrival: {
    displayName: 'Hosting Guests',
    subcategories: [
      { id: 'tea_coffee', name: 'Tea & Coffee', icon: '☕', query: 'tea' },
      { id: 'juices_drinks', name: 'Juices & Beverages', icon: '🧃', query: 'juice' },
      { id: 'biscuits', name: 'Cookies & Biscuits', icon: '🍪', query: 'biscuit' },
      { id: 'party_snacks', name: 'Party Snacks', icon: '🥨', query: 'chips' },
    ],
  },
  baby_care: {
    displayName: 'Baby Care',
    subcategories: [
      { id: 'baby_food', name: 'Baby Food', icon: '🍼', query: 'cerelac' },
      { id: 'diapers', name: 'Diapers & Wipes', icon: '👶', query: 'diaper' },
      { id: 'baby_skin', name: 'Baby Skincare', icon: '🧴', query: 'lotion' },
    ],
  },
  pet_care: {
    displayName: 'Pet Care',
    subcategories: [
      { id: 'dog_food', name: 'Dog Food & Treats', icon: '🐶', query: 'pedigree' },
      { id: 'cat_care', name: 'Cat Care & Litter', icon: '🐱', query: 'whiskas' },
    ],
  },
};

export const MissionCategoryRail: React.FC = () => {
  const { selectedMissionKey, detectedMission, activeSubcategoryFilter, setSubcategoryFilter } = useCartStore();

  const activeMissionKey = selectedMissionKey || detectedMission?.mission || 'breakfast';
  const config = MISSION_CATEGORIES[activeMissionKey] || MISSION_CATEGORIES.breakfast;

  return (
    <section className="bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-700/50 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="bg-yellow-400 text-black font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 fill-black" />
            AI MISSION-ALIGNED CATEGORIES
          </span>
          <h2 className="text-xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Categories for your {config.displayName}
          </h2>
        </div>
        <p className="text-xs text-emerald-200 font-medium">
          1-Tap Intent Clustering • Tap any subcategory to filter items
        </p>
      </div>

      {/* Subcategory Pills Grid */}
      <div className="flex flex-wrap gap-2.5">
        {config.subcategories.map((sub) => {
          const isActive = activeSubcategoryFilter === sub.query || activeSubcategoryFilter === sub.name;
          return (
            <button
              key={sub.id}
              onClick={() => setSubcategoryFilter(sub.query || sub.name)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all transform active:scale-95 border ${
                isActive
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg scale-105 ring-2 ring-yellow-400/50'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15 backdrop-blur-md'
              }`}
            >
              <span className="text-base">{sub.icon}</span>
              <span>{sub.name}</span>
              {isActive && <CheckCircle className="w-3.5 h-3.5 fill-black text-yellow-400 ml-1" />}
            </button>
          );
        })}
      </div>
    </section>
  );
};
