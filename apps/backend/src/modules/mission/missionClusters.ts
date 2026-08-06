/**
 * Mission → subcategory cluster → catalog subcategory mapping.
 * Each cluster groups representative product categories/SKUs the quick-commerce catalog carries.
 * Core clusters drive completion %; adjacent clusters are mission-gap recommendation candidates.
 */

export interface MissionCluster {
  id: string;
  name: string;
  icon: string;
  /** Locked catalog subcategory names (see seed TAXONOMY_CATALOG) */
  catalogSubcategories: string[];
  searchQuery: string;
  productExamples: string[];
  isAdjacent?: boolean;
}

export interface MissionClusterDefinition {
  key: string;
  displayName: string;
  icon: string;
  clusters: MissionCluster[];
}

export const MISSION_CLUSTER_DEFINITIONS: MissionClusterDefinition[] = [
  {
    key: 'breakfast',
    displayName: 'Breakfast Prep',
    icon: '🍳',
    clusters: [
      {
        id: 'staples',
        name: 'Staples (Bread, Eggs, Milk, Butter)',
        icon: '🍞',
        catalogSubcategories: ['Bread & Buns', 'Eggs & Paneer', 'Milk & Curd'],
        searchQuery: 'bread',
        productExamples: ['bread', 'eggs', 'milk', 'butter', 'cheese slices'],
      },
      {
        id: 'cereals_spreads',
        name: 'Cereal & Spreads (Muesli, Jam, Honey)',
        icon: '🥣',
        catalogSubcategories: ['Breakfast Cereals', 'Cookies & Biscuits'],
        searchQuery: 'oats',
        productExamples: ['cornflakes', 'muesli', 'jam', 'peanut butter', 'honey'],
      },
      {
        id: 'beverages',
        name: 'Beverages (Tea, Coffee, Bournvita)',
        icon: '☕',
        catalogSubcategories: ['Tea & Coffee', 'Health Drinks'],
        searchQuery: 'tea',
        productExamples: ['tea', 'coffee', 'Bournvita', 'Horlicks'],
      },
      {
        id: 'quick_prep',
        name: 'Quick-prep (Poha, Upma, Parathas)',
        icon: '🥞',
        catalogSubcategories: ['Frozen Snacks', 'Breakfast Cereals'],
        searchQuery: 'poha',
        productExamples: ['poha mix', 'upma mix', 'paratha', 'ketchup', 'mayo'],
      },
      {
        id: 'adjacent_gap',
        name: 'Adjacent Gap (Napkins, Dish Soap)',
        icon: '🧻',
        catalogSubcategories: ['Disposables', 'Cleaners & Fresheners'],
        searchQuery: 'napkins',
        productExamples: ['napkins', 'dish soap'],
        isAdjacent: true,
      },
    ],
  },
  {
    key: 'meal_prep',
    displayName: 'Kitchen Meal Prep',
    icon: '🔪',
    clusters: [
      {
        id: 'produce',
        name: 'Fresh Produce (Veggies, Fruits, Herbs)',
        icon: '🥬',
        catalogSubcategories: ['Fresh Vegetables', 'Fresh Fruits', 'Herbs & Seasonings'],
        searchQuery: 'onion',
        productExamples: ['vegetables', 'fruits', 'herbs'],
      },
      {
        id: 'proteins',
        name: 'Proteins (Paneer, Eggs, Tofu)',
        icon: '🍗',
        catalogSubcategories: ['Eggs & Paneer'],
        searchQuery: 'paneer',
        productExamples: ['chicken', 'mutton', 'fish', 'paneer', 'tofu', 'eggs'],
      },
      {
        id: 'pantry_basics',
        name: 'Pantry Basics (Oil, Atta, Rice, Spices)',
        icon: '🌾',
        catalogSubcategories: ['Spices & Oils', 'Flours & Grains', 'Pulses & Dal'],
        searchQuery: 'atta',
        productExamples: ['oil', 'atta', 'rice', 'spices', 'salt'],
      },
      {
        id: 'tools_storage',
        name: 'Tools & Storage (Wrap, Containers)',
        icon: '🔪',
        catalogSubcategories: ['Disposables'],
        searchQuery: 'wrap',
        productExamples: ['chopping board', 'cling wrap', 'containers'],
      },
      {
        id: 'adjacent_gap',
        name: 'Adjacent Gap (Kitchen Gloves, Trash Bags)',
        icon: '🧤',
        catalogSubcategories: ['Disposables', 'Cleaners & Fresheners'],
        searchQuery: 'gloves',
        productExamples: ['kitchen gloves', 'garbage bags', 'aprons'],
        isAdjacent: true,
      },
    ],
  },
  {
    key: 'dinner_prep',
    displayName: 'Dinner Cooking',
    icon: '🥗',
    clusters: [
      {
        id: 'core_ingredients',
        name: 'Core Ingredients (Rice, Dal, Veggies, Protein)',
        icon: '🍚',
        catalogSubcategories: ['Flours & Grains', 'Pulses & Dal', 'Fresh Vegetables', 'Eggs & Paneer'],
        searchQuery: 'dal',
        productExamples: ['rice', 'roti staples', 'dal', 'vegetables', 'meat', 'fish'],
      },
      {
        id: 'spices_masalas',
        name: 'Spices & Masalas (Garam Masala, Pastes)',
        icon: '🌶️',
        catalogSubcategories: ['Spices & Oils', 'Herbs & Seasonings'],
        searchQuery: 'masala',
        productExamples: ['garam masala', 'curry pastes', 'ready masalas'],
      },
      {
        id: 'cooking_essentials',
        name: 'Essentials (Ghee, Oil, Coconut Milk)',
        icon: '🫕',
        catalogSubcategories: ['Spices & Oils', 'Milk & Curd'],
        searchQuery: 'ghee',
        productExamples: ['ghee', 'oil', 'cooking cream', 'coconut milk'],
      },
      {
        id: 'accompaniments',
        name: 'Accompaniments (Pickles, Papad, Curd)',
        icon: '🥒',
        catalogSubcategories: ['Spices & Oils', 'Milk & Curd', 'Cookies & Biscuits'],
        searchQuery: 'curd',
        productExamples: ['pickles', 'papad', 'curd'],
      },
      {
        id: 'adjacent_gap',
        name: 'Adjacent Gap (Dishwash & Storage)',
        icon: '🧽',
        catalogSubcategories: ['Cleaners & Fresheners', 'Disposables'],
        searchQuery: 'dishwash',
        productExamples: ['dishwashing liquid', 'food storage containers'],
        isAdjacent: true,
      },
    ],
  },
  {
    key: 'monthly_grocery',
    displayName: 'Monthly Restock',
    icon: '🛒',
    clusters: [
      {
        id: 'grains_pulses',
        name: 'Grains & Pulses (Bulk Rice, Atta, Dal)',
        icon: '📦',
        catalogSubcategories: ['Flours & Grains', 'Pulses & Dal', 'Spices & Oils'],
        searchQuery: 'rice',
        productExamples: ['rice', 'atta', 'dal', 'sugar', 'salt'],
      },
      {
        id: 'personal_care',
        name: 'Personal Care (Shampoo, Soap, Dental)',
        icon: '🧴',
        catalogSubcategories: ['Bath & Body', 'Oral Care', 'Skin & Hair Care'],
        searchQuery: 'shampoo',
        productExamples: ['shampoo', 'soap', 'toothpaste', 'sanitary products'],
      },
      {
        id: 'home_care',
        name: 'Home Care (Detergent, Floor Cleaner)',
        icon: '🧹',
        catalogSubcategories: ['Detergents', 'Cleaners & Fresheners'],
        searchQuery: 'detergent',
        productExamples: ['detergent', 'floor cleaner', 'toilet cleaner', 'dishwash bars'],
      },
      {
        id: 'long_shelf_life',
        name: 'Long Shelf-Life (Oil & Ghee Packs)',
        icon: '🛢️',
        catalogSubcategories: ['Spices & Oils', 'Tea & Coffee', 'Milk & Curd'],
        searchQuery: 'oil',
        productExamples: ['oil large pack', 'ghee', 'tea', 'coffee refills'],
      },
      {
        id: 'adjacent_gap',
        name: 'Adjacent Gap (Snack Packs, Purifier)',
        icon: '🚰',
        catalogSubcategories: ['Chips & Namkeen', 'Cleaners & Fresheners'],
        searchQuery: 'chips',
        productExamples: ['bulk snack packs', 'water purifier cartridges', 'pest control'],
        isAdjacent: true,
      },
    ],
  },
  {
    key: 'movie_night',
    displayName: 'Movie Night',
    icon: '🍿',
    clusters: [
      {
        id: 'snacks',
        name: 'Snacks (Popcorn, Chips, Nachos)',
        icon: '🍿',
        catalogSubcategories: ['Chips & Namkeen', 'Frozen Snacks'],
        searchQuery: 'chips',
        productExamples: ['popcorn', 'chips', 'nachos', 'namkeen'],
      },
      {
        id: 'beverages',
        name: 'Beverages (Sodas, Juices, Mixers)',
        icon: '🥤',
        catalogSubcategories: ['Soft Drinks & Juices'],
        searchQuery: 'coca-cola',
        productExamples: ['soft drinks', 'juices', 'mocktail mixers'],
      },
      {
        id: 'indulgence',
        name: 'Indulgence (Ice Cream, Chocolates, Dips)',
        icon: '🍦',
        catalogSubcategories: ['Chocolates', 'Frozen Snacks', 'Chips & Namkeen'],
        searchQuery: 'chocolate',
        productExamples: ['ice cream', 'chocolates', 'salsa', 'cheese dip'],
      },
      {
        id: 'adjacent_gap',
        name: 'Adjacent Gap (Disposables, Tissues)',
        icon: '🔌',
        catalogSubcategories: ['Disposables'],
        searchQuery: 'tissues',
        productExamples: ['disposable plates', 'cups', 'tissues'],
        isAdjacent: true,
      },
    ],
  },
  {
    key: 'guest_arrival',
    displayName: 'Hosting Guests',
    icon: '☕',
    clusters: [
      {
        id: 'party_food',
        name: 'Party Food (Starters, Sweets)',
        icon: '🥟',
        catalogSubcategories: ['Frozen Snacks', 'Chips & Namkeen', 'Cakes & Rusks'],
        searchQuery: 'starters',
        productExamples: ['frozen appetizers', 'namkeen', 'mithai', 'desserts'],
      },
      {
        id: 'welcome_drinks',
        name: 'Beverages (Juices, Mocktail Mixes)',
        icon: '🍹',
        catalogSubcategories: ['Soft Drinks & Juices', 'Tea & Coffee'],
        searchQuery: 'juice',
        productExamples: ['soft drinks', 'juices', 'welcome-drink mixes'],
      },
      {
        id: 'disposables',
        name: 'Disposables (Plates, Cups, Cutlery)',
        icon: '🍽️',
        catalogSubcategories: ['Disposables'],
        searchQuery: 'plates',
        productExamples: ['plates', 'cups', 'napkins', 'cutlery'],
      },
      {
        id: 'ambience',
        name: 'Ambience (Candles, Air Fresheners)',
        icon: '🕯️',
        catalogSubcategories: ['Cleaners & Fresheners'],
        searchQuery: 'freshener',
        productExamples: ['candles', 'air freshener', 'flowers'],
      },
      {
        id: 'adjacent_gap',
        name: 'Adjacent Gap (Ice, Guest Toiletries)',
        icon: '🧊',
        catalogSubcategories: ['Frozen Snacks', 'Bath & Body'],
        searchQuery: 'ice',
        productExamples: ['cooking oil', 'ice cubes', 'guest toiletries'],
        isAdjacent: true,
      },
    ],
  },
  {
    key: 'baby_care',
    displayName: 'Baby Care',
    icon: '🍼',
    clusters: [
      {
        id: 'feeding',
        name: 'Feeding (Formula, Baby Food, Bottles)',
        icon: '🍼',
        catalogSubcategories: ['Baby Food'],
        searchQuery: 'cerelac',
        productExamples: ['formula', 'baby food', 'bottles', 'sippers'],
      },
      {
        id: 'hygiene',
        name: 'Hygiene (Diapers, Wipes, Baby Soap)',
        icon: '👶',
        catalogSubcategories: ['Diapers & Wipes', 'Baby Skin Care'],
        searchQuery: 'diapers',
        productExamples: ['diapers', 'wipes', 'baby soap', 'shampoo', 'rash cream'],
      },
      {
        id: 'health',
        name: 'Health (Thermometer, Teething Gel)',
        icon: '🩺',
        catalogSubcategories: ['Baby Skin Care', 'Baby Food'],
        searchQuery: 'saline',
        productExamples: ['thermometer', 'saline drops', 'teething gel'],
      },
      {
        id: 'adjacent_gap',
        name: 'Adjacent Gap (Baby Detergent, Repellent)',
        icon: '🛡️',
        catalogSubcategories: ['Detergents', 'Cleaners & Fresheners'],
        searchQuery: 'baby detergent',
        productExamples: ['baby-safe detergent', 'mosquito repellent', 'toys', 'teethers'],
        isAdjacent: true,
      },
    ],
  },
  {
    key: 'pet_care',
    displayName: 'Pet Care',
    icon: '🐾',
    clusters: [
      {
        id: 'food',
        name: 'Pet Food (Dry Food, Wet Treats)',
        icon: '🥩',
        catalogSubcategories: ['Pet Food'],
        searchQuery: 'pedigree',
        productExamples: ['dry food', 'wet food', 'treats', 'pet milk'],
      },
      {
        id: 'hygiene',
        name: 'Hygiene (Shampoo, Litter, Poop Bags)',
        icon: '🦮',
        catalogSubcategories: ['Pet Hygiene'],
        searchQuery: 'litter',
        productExamples: ['pet shampoo', 'litter', 'poop bags', 'wipes'],
      },
      {
        id: 'health',
        name: 'Health (Flea Treatment, Vitamins)',
        icon: '💊',
        catalogSubcategories: ['Pet Hygiene', 'Pet Accessories'],
        searchQuery: 'vitamins',
        productExamples: ['flea treatment', 'tick treatment', 'pet vitamins'],
      },
      {
        id: 'adjacent_gap',
        name: 'Adjacent Gap (Pet Toys, Accident Cleaner)',
        icon: '🎾',
        catalogSubcategories: ['Pet Accessories', 'Cleaners & Fresheners'],
        searchQuery: 'toys',
        productExamples: ['pet toys', 'leash', 'collar', 'cleaning spray'],
        isAdjacent: true,
      },
    ],
  },
];

export const MISSION_CLUSTER_MAP = Object.fromEntries(
  MISSION_CLUSTER_DEFINITIONS.map((m) => [m.key, m])
) as Record<string, MissionClusterDefinition>;

/** One representative catalog subcategory per core cluster — used for DB seed checklistCategories */
export function getCoreChecklistSubcategories(missionKey: string): string[] {
  const def = MISSION_CLUSTER_MAP[missionKey];
  if (!def) return [];
  return def.clusters
    .filter((c) => !c.isAdjacent)
    .map((c) => c.catalogSubcategories[0]);
}

export function getMissionClusters(missionKey?: string): MissionClusterDefinition[] {
  if (missionKey) {
    const def = MISSION_CLUSTER_MAP[missionKey];
    return def ? [def] : [];
  }
  return MISSION_CLUSTER_DEFINITIONS;
}

export function isClusterFilled(cartSubcategories: Set<string>, cluster: MissionCluster): boolean {
  return cluster.catalogSubcategories.some((sub) => cartSubcategories.has(sub));
}

export function getMissingClusters(
  cartSubcategories: Set<string>,
  missionKey: string,
  includeAdjacent = false
): MissionCluster[] {
  const def = MISSION_CLUSTER_MAP[missionKey];
  if (!def) return [];
  return def.clusters.filter(
    (c) => (includeAdjacent || !c.isAdjacent) && !isClusterFilled(cartSubcategories, c)
  );
}
