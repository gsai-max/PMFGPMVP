'use client';

import React from 'react';
import { Sparkles, Layers, CheckCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

interface MissionCategoryConfig {
  displayName: string;
  subcategories: Array<{ id: string; name: string; icon: string; query?: string; isAdjacent?: boolean }>;
}

const MISSION_CATEGORIES: Record<string, MissionCategoryConfig> = {
  breakfast: {
    displayName: 'Breakfast Prep',
    subcategories: [
      { id: 'staples', name: 'Staples (Bread, Eggs, Milk, Butter)', icon: '🍞', query: 'bread' },
      { id: 'cereals_spreads', name: 'Cereal & Spreads (Muesli, Jam, Honey)', icon: '🥣', query: 'oats' },
      { id: 'beverages', name: 'Beverages (Tea, Coffee, Bournvita)', icon: '☕', query: 'tea' },
      { id: 'quick_prep', name: 'Quick-prep (Poha, Upma, Parathas)', icon: '🥞', query: 'poha' },
      { id: 'adjacent_gap', name: 'Adjacent Gap (Napkins, Dish Soap)', icon: '🧻', query: 'napkins', isAdjacent: true },
    ],
  },
  meal_prep: {
    displayName: 'Meal Prep',
    subcategories: [
      { id: 'produce', name: 'Fresh Produce (Veggies, Fruits, Herbs)', icon: '🥬', query: 'onion' },
      { id: 'proteins', name: 'Proteins (Chicken, Paneer, Eggs)', icon: '🍗', query: 'paneer' },
      { id: 'pantry_basics', name: 'Pantry Basics (Oil, Atta, Rice, Spices)', icon: '🌾', query: 'atta' },
      { id: 'tools_storage', name: 'Tools & Storage (Boards, Cling Wrap)', icon: '🔪', query: 'wrap' },
      { id: 'adjacent_gap', name: 'Adjacent Gap (Kitchen Gloves, Trash Bags)', icon: '🧤', query: 'gloves', isAdjacent: true },
    ],
  },
  dinner_prep: {
    displayName: 'Dinner Cooking',
    subcategories: [
      { id: 'core_ingredients', name: 'Core Ingredients (Rice, Dal, Veggies, Meat)', icon: '🍚', query: 'dal' },
      { id: 'spices_masalas', name: 'Spices & Masalas (Garam Masala, Pastes)', icon: '🌶️', query: 'masala' },
      { id: 'cooking_essentials', name: 'Essentials (Ghee, Oil, Coconut Milk)', icon: '🫕', query: 'ghee' },
      { id: 'accompaniments', name: 'Accompaniments (Pickles, Papad, Curd)', icon: '🥒', query: 'curd' },
      { id: 'adjacent_gap', name: 'Adjacent Gap (Dishwash & Storage Containers)', icon: '🧽', query: 'dishwash', isAdjacent: true },
    ],
  },
  monthly_grocery: {
    displayName: 'Monthly Restock',
    subcategories: [
      { id: 'grains_pulses', name: 'Grains & Pulses (Bulk Rice, Atta, Dal)', icon: '📦', query: 'rice' },
      { id: 'personal_care', name: 'Personal Care (Shampoo, Soap, Dental)', icon: '🧴', query: 'shampoo' },
      { id: 'home_care', name: 'Home Care (Detergent, Floor Cleaner)', icon: '🧹', query: 'detergent' },
      { id: 'long_shelf_life', name: 'Long Shelf-Life (Oil & Ghee Packs)', icon: '🛢️', query: 'oil' },
      { id: 'adjacent_gap', name: 'Adjacent Gap (Snack Packs, Water Purifier)', icon: '🚰', query: 'purifier', isAdjacent: true },
    ],
  },
  movie_night: {
    displayName: 'Movie Night',
    subcategories: [
      { id: 'snacks', name: 'Snacks (Popcorn, Chips, Nachos)', icon: '🍿', query: 'chips' },
      { id: 'beverages', name: 'Beverages (Sodas, Juices, Mixers)', icon: '🥤', query: 'coca-cola' },
      { id: 'indulgence', name: 'Indulgence (Ice Cream, Chocolates, Dips)', icon: '🍦', query: 'chocolate' },
      { id: 'adjacent_gap', name: 'Adjacent Gap (Disposables, Tissues, Cables)', icon: '🔌', query: 'tissues', isAdjacent: true },
    ],
  },
  guest_arrival: {
    displayName: 'Hosting Guests',
    subcategories: [
      { id: 'party_food', name: 'Party Food (Starters, Sweets)', icon: '🥟', query: 'starters' },
      { id: 'welcome_drinks', name: 'Beverages (Juices, Mocktail Mixes)', icon: '🍹', query: 'juice' },
      { id: 'disposables', name: 'Disposables (Plates, Cups, Cutlery)', icon: '🍽️', query: 'plates' },
      { id: 'ambience', name: 'Ambience (Candles, Air Fresheners)', icon: '🕯️', query: 'freshener' },
      { id: 'adjacent_gap', name: 'Adjacent Gap (Ice Cubes, Guest Toiletries)', icon: '🧊', query: 'ice', isAdjacent: true },
    ],
  },
  baby_care: {
    displayName: 'Baby Care',
    subcategories: [
      { id: 'feeding', name: 'Feeding (Formula, Baby Food, Bottles)', icon: '🍼', query: 'cerelac' },
      { id: 'hygiene', name: 'Hygiene (Diapers, Wipes, Baby Soap)', icon: '👶', query: 'diapers' },
      { id: 'health', name: 'Health (Thermometer, Teething Gel)', icon: '🩺', query: 'saline' },
      { id: 'adjacent_gap', name: 'Adjacent Gap (Baby Detergent, Repellent)', icon: '🛡️', query: 'baby detergent', isAdjacent: true },
    ],
  },
  pet_care: {
    displayName: 'Pet Care',
    subcategories: [
      { id: 'food', name: 'Pet Food (Dry Food, Wet Treats)', icon: '🥩', query: 'pedigree' },
      { id: 'hygiene', name: 'Hygiene (Shampoo, Litter, Poop Bags)', icon: '🦮', query: 'litter' },
      { id: 'health', name: 'Health (Flea Treatment, Vitamins)', icon: '💊', query: 'vitamins' },
      { id: 'adjacent_gap', name: 'Adjacent Gap (Pet Toys, Accident Cleaner)', icon: '🎾', query: 'toys', isAdjacent: true },
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
