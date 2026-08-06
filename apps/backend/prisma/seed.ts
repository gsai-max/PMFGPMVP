import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getCoreChecklistSubcategories } from '../src/modules/mission/missionClusters';

const prisma = new PrismaClient();

// Check if running on SQLite vs PostgreSQL based on environment / provider
const isSqlite = process.env.DATABASE_URL?.startsWith('file:');

// 8 primary clustered missions + 4 extended missions
const MISSIONS = [
  {
    key: 'breakfast',
    displayName: 'Breakfast Prep 🍳',
    checklistCategories: getCoreChecklistSubcategories('breakfast'),
    icon: '🍳',
  },
  {
    key: 'meal_prep',
    displayName: 'Meal Prep 🍳',
    checklistCategories: getCoreChecklistSubcategories('meal_prep'),
    icon: '🍳',
  },
  {
    key: 'monthly_grocery',
    displayName: 'Monthly Restock 🛒',
    checklistCategories: getCoreChecklistSubcategories('monthly_grocery'),
    icon: '🛒',
  },
  {
    key: 'movie_night',
    displayName: 'Movie & Snack Night 🍿',
    checklistCategories: getCoreChecklistSubcategories('movie_night'),
    icon: '🍿',
  },
  {
    key: 'guest_arrival',
    displayName: 'Hosting Guests ☕',
    checklistCategories: getCoreChecklistSubcategories('guest_arrival'),
    icon: '☕',
  },
  {
    key: 'baby_care',
    displayName: 'Baby Essentials 🍼',
    checklistCategories: getCoreChecklistSubcategories('baby_care'),
    icon: '🍼',
  },
  {
    key: 'pet_care',
    displayName: 'Pet Care Restock 🐾',
    checklistCategories: getCoreChecklistSubcategories('pet_care'),
    icon: '🐾',
  },
  {
    key: 'house_cleaning',
    displayName: 'House Cleaning 🧹',
    checklistCategories: ['Detergents', 'Cleaners & Fresheners', 'Disposables'],
    icon: '🧹',
  },
  {
    key: 'personal_care',
    displayName: 'Personal Hygiene & Self-Care 🧼',
    checklistCategories: ['Bath & Body', 'Oral Care', 'Skin & Hair Care'],
    icon: '🧼',
  },
  {
    key: 'office_snacks',
    displayName: 'Quick Tea & Work Snacks ☕',
    checklistCategories: ['Tea & Coffee', 'Cookies & Biscuits', 'Chips & Namkeen', 'Soft Drinks & Juices'],
    icon: '☕',
  },
  {
    key: 'fitness_nutrition',
    displayName: 'Fitness & Health Prep 🏋️',
    checklistCategories: ['Fresh Fruits', 'Eggs & Paneer', 'Breakfast Cereals', 'Health Drinks'],
    icon: '🏋️',
  },
  {
    key: 'late_night_cravings',
    displayName: 'Late Night Cravings 🌙',
    checklistCategories: ['Chocolates', 'Chips & Namkeen', 'Cakes & Rusks', 'Soft Drinks & Juices'],
    icon: '🌙',
  },
];

// 10 Locked Categories with 30 Subcategories and ~540 Products (18 per subcategory)
const TAXONOMY_CATALOG = [
  {
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
    subcategories: [
      {
        name: 'Fresh Fruits',
        slug: 'fresh-fruits',
        products: [
          { name: 'Fresh Indian Banana (Robusta)', price: 39, mrp: 45, unit: '1 kg', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Shimla Red Apples', price: 140, mrp: 160, unit: '4 pcs (600g)', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Nagpur Sweet Oranges', price: 75, mrp: 90, unit: '1 kg', tags: ['breakfast'] },
          { name: 'Alphonso Mangoes', price: 299, mrp: 350, unit: '1 kg', tags: ['breakfast', 'late_night_cravings'] },
          { name: 'Black Seedless Grapes', price: 85, mrp: 100, unit: '500 g', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Ripe Red Papaya', price: 45, mrp: 55, unit: '1 pc (approx 1kg)', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Fresh Pomegranate (Anar)', price: 120, mrp: 140, unit: '500 g', tags: ['fitness_nutrition'] },
          { name: 'Sweet Queen Pineapple', price: 65, mrp: 80, unit: '1 pc', tags: ['breakfast'] },
          { name: 'Fresh Watermelon', price: 50, mrp: 65, unit: '1 pc (approx 2kg)', tags: ['fitness_nutrition'] },
          { name: 'Imported Green Kiwis', price: 99, mrp: 120, unit: '3 pcs', tags: ['fitness_nutrition'] },
          { name: 'Fresh Mahabaleshwar Strawberries', price: 110, mrp: 130, unit: '200 g', tags: ['late_night_cravings'] },
          { name: 'Fresh Pink Guava', price: 60, mrp: 75, unit: '500 g', tags: ['fitness_nutrition'] },
          { name: 'Sweet Muskmelon', price: 45, mrp: 55, unit: '1 pc (1kg)', tags: ['fitness_nutrition'] },
          { name: 'Exotic Red Dragon Fruit', price: 95, mrp: 115, unit: '1 pc', tags: ['fitness_nutrition'] },
          { name: 'Green Bartlett Pears', price: 130, mrp: 150, unit: '500 g', tags: ['breakfast'] },
          { name: 'Fresh Blueberries', price: 199, mrp: 240, unit: '125 g', tags: ['fitness_nutrition'] },
          { name: 'Fresh Brown Chiku (Sapota)', price: 48, mrp: 60, unit: '500 g', tags: ['breakfast'] },
          { name: 'Fresh Custard Apple (Sitaphal)', price: 140, mrp: 165, unit: '500 g', tags: ['late_night_cravings'] },
        ],
      },
      {
        name: 'Fresh Vegetables',
        slug: 'fresh-vegetables',
        products: [
          { name: 'Hybrid Red Tomatoes', price: 28, mrp: 35, unit: '500 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Red Onions', price: 32, mrp: 40, unit: '1 kg', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'New Crop Potatoes', price: 25, mrp: 30, unit: '1 kg', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Ooty Orange Carrots', price: 35, mrp: 45, unit: '500 g', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Fresh Green Broccoli', price: 65, mrp: 80, unit: '250 g', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Green Capsicum (Shimla Mirch)', price: 30, mrp: 40, unit: '250 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Crisp Green Cucumber', price: 22, mrp: 30, unit: '500 g', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Fresh Cauliflower (Gobhi)', price: 35, mrp: 45, unit: '1 pc (approx 500g)', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Spinach (Palak)', price: 20, mrp: 25, unit: '250 g', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Tender Lady Finger (Bhindi)', price: 28, mrp: 35, unit: '250 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Green Peas (Matar)', price: 45, mrp: 60, unit: '500 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Button Mushrooms', price: 55, mrp: 65, unit: '200 g pack', tags: ['dinner_prep', 'breakfast'] },
          { name: 'Fresh Ginger (Adrak)', price: 30, mrp: 40, unit: '200 g', tags: ['dinner_prep', 'breakfast', 'office_snacks'] },
          { name: 'Garlic Bulbs (Lahsun)', price: 45, mrp: 55, unit: '200 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Juicy Lemons', price: 25, mrp: 30, unit: '4 pcs', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Sweet Potato (Shakarkandi)', price: 35, mrp: 45, unit: '500 g', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Fresh Pumpkin (Kaddu)', price: 22, mrp: 30, unit: '500 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Tender Bottle Gourd (Lauki)', price: 24, mrp: 32, unit: '1 pc (approx 600g)', tags: ['dinner_prep', 'fitness_nutrition'] },
        ],
      },
      {
        name: 'Herbs & Seasonings',
        slug: 'herbs-seasonings',
        products: [
          { name: 'Coriander & Green Chillies Combo', price: 15, mrp: 20, unit: '1 pack', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Mint Leaves (Pudina)', price: 12, mrp: 18, unit: '100 g', tags: ['dinner_prep', 'guest_arrival'] },
          { name: 'Fresh Curry Leaves', price: 10, mrp: 15, unit: '50 g', tags: ['dinner_prep', 'breakfast'] },
          { name: 'Spicy Green Chillies', price: 15, mrp: 20, unit: '100 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Lemongrass', price: 20, mrp: 28, unit: '100 g', tags: ['office_snacks', 'fitness_nutrition'] },
          { name: 'Fresh Sweet Basil Leaves', price: 35, mrp: 45, unit: '50 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Parsley', price: 30, mrp: 40, unit: '50 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Oregano Leaves', price: 40, mrp: 50, unit: '30 g', tags: ['dinner_prep', 'movie_night'] },
          { name: 'Fresh Rosemary Sprigs', price: 45, mrp: 60, unit: '30 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Thyme Leaves', price: 45, mrp: 60, unit: '30 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Spring Onions with Greens', price: 25, mrp: 35, unit: '250 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Celery Sticks', price: 35, mrp: 48, unit: '200 g', tags: ['fitness_nutrition'] },
          { name: 'Fresh Dill Leaves (Suva)', price: 18, mrp: 25, unit: '100 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Methi Leaves (Fenugreek)', price: 20, mrp: 28, unit: '250 g', tags: ['dinner_prep', 'breakfast'] },
          { name: 'Fresh Mustard Greens (Sarson)', price: 22, mrp: 30, unit: '250 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Sage Leaves', price: 50, mrp: 65, unit: '25 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fresh Raw Turmeric Root', price: 25, mrp: 35, unit: '100 g', tags: ['fitness_nutrition'] },
          { name: 'Exotic Herb Salad Mix', price: 65, mrp: 85, unit: '120 g', tags: ['fitness_nutrition', 'dinner_prep'] },
        ],
      },
    ],
  },
  {
    name: 'Dairy & Breakfast',
    slug: 'dairy-breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=400',
    subcategories: [
      {
        name: 'Milk & Curd',
        slug: 'milk-curd',
        products: [
          { name: 'Amul Taaza Toned Fresh Milk', price: 27, mrp: 30, unit: '500 ml', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Country Delight Cow Milk', price: 38, mrp: 42, unit: '500 ml', tags: ['breakfast'] },
          { name: 'Mother Dairy Full Cream Milk', price: 33, mrp: 35, unit: '500 ml', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Amul Masti Dahi Curd Pouch', price: 35, mrp: 40, unit: '400 g', tags: ['breakfast', 'dinner_prep'] },
          { name: 'Nestlé A+ Nourish Dahi', price: 45, mrp: 52, unit: '400 g', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Epigamia Natural Greek Yogurt', price: 60, mrp: 70, unit: '100 g', tags: ['fitness_nutrition', 'breakfast'] },
          { name: 'Milky Mist Premium Curd Tub', price: 55, mrp: 65, unit: '500 g', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Amul Salted Buttermilk (Chaas)', price: 15, mrp: 18, unit: '200 ml', tags: ['breakfast', 'office_snacks'] },
          { name: 'Gowardhan Fresh Cow Milk', price: 32, mrp: 36, unit: '500 ml', tags: ['breakfast'] },
          { name: 'Heritage Toned Fresh Milk', price: 26, mrp: 29, unit: '500 ml', tags: ['breakfast'] },
          { name: 'Nandini GoodLife Cow Milk Pouch', price: 28, mrp: 31, unit: '500 ml', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Danone Vanilla Yogurt', price: 35, mrp: 40, unit: '80 g', tags: ['late_night_cravings', 'breakfast'] },
          { name: 'Amul Slim & Trim Skimmed Milk', price: 30, mrp: 34, unit: '500 ml', tags: ['fitness_nutrition'] },
          { name: 'Country Delight Buffalo Milk', price: 42, mrp: 48, unit: '500 ml', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Mother Dairy Cow Milk Pouch', price: 29, mrp: 32, unit: '500 ml', tags: ['breakfast'] },
          { name: 'Milky Mist Mishti Doi', price: 40, mrp: 48, unit: '100 g', tags: ['late_night_cravings'] },
          { name: 'Amul Gold Standard Full Cream Milk', price: 34, mrp: 38, unit: '500 ml', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Epigamia Alphonso Mango Greek Yogurt', price: 65, mrp: 75, unit: '90 g', tags: ['fitness_nutrition', 'late_night_cravings'] },
        ],
      },
      {
        name: 'Eggs & Paneer',
        slug: 'eggs-paneer',
        products: [
          { name: 'Farm Fresh White Eggs (6 pcs)', price: 48, mrp: 55, unit: '6 pcs', tags: ['breakfast', 'dinner_prep', 'fitness_nutrition'] },
          { name: 'Organic Brown Eggs (6 pcs)', price: 75, mrp: 90, unit: '6 pcs', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'White Eggs Economy Pack (30 pcs)', price: 210, mrp: 245, unit: '30 pcs', tags: ['monthly_grocery', 'fitness_nutrition'] },
          { name: 'Fresh Malai Paneer 200g', price: 95, mrp: 110, unit: '200 g', tags: ['dinner_prep', 'breakfast'] },
          { name: 'Amul Fresh Soft Paneer', price: 90, mrp: 105, unit: '200 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Milky Mist Fresh Paneer Block', price: 98, mrp: 115, unit: '200 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Country Delight Farm Fresh Eggs (10 pcs)', price: 85, mrp: 100, unit: '10 pcs', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Eggoz Protein-Rich Brown Eggs (6 pcs)', price: 89, mrp: 105, unit: '6 pcs', tags: ['fitness_nutrition'] },
          { name: 'Mother Dairy Fresh Paneer', price: 92, mrp: 108, unit: '200 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Gowardhan Fresh Paneer', price: 88, mrp: 102, unit: '200 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'ID Fresh Soft Paneer Cubes', price: 105, mrp: 120, unit: '200 g', tags: ['dinner_prep', 'breakfast'] },
          { name: 'Eggy’s Free Range Country Eggs (6 pcs)', price: 95, mrp: 115, unit: '6 pcs', tags: ['fitness_nutrition'] },
          { name: 'Omega-3 Enriched Eggs (6 pcs)', price: 82, mrp: 98, unit: '6 pcs', tags: ['fitness_nutrition'] },
          { name: 'Fresh Quail Eggs (12 pcs)', price: 110, mrp: 130, unit: '12 pcs', tags: ['fitness_nutrition'] },
          { name: 'Organic Tofu Block 250g', price: 75, mrp: 90, unit: '250 g', tags: ['fitness_nutrition', 'dinner_prep'] },
          { name: 'Fried Paneer Diced Cubes 200g', price: 115, mrp: 135, unit: '200 g', tags: ['dinner_prep', 'movie_night'] },
          { name: 'Egg White Liquid Carton 250ml', price: 125, mrp: 145, unit: '250 ml', tags: ['fitness_nutrition'] },
          { name: 'Amul Cheese Slices (10 Slices)', price: 135, mrp: 150, unit: '200 g', tags: ['breakfast', 'late_night_cravings'] },
        ],
      },
      {
        name: 'Breakfast Cereals',
        slug: 'breakfast-cereals',
        products: [
          { name: 'Kellogg’s Corn Flakes Original', price: 185, mrp: 210, unit: '475 g', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Quaker Rolled Oats 1kg', price: 190, mrp: 220, unit: '1 kg', tags: ['breakfast', 'fitness_nutrition', 'monthly_grocery'] },
          { name: 'Bagrry’s Crunchy Muesli Fruit & Nut', price: 299, mrp: 350, unit: '400 g', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Kellogg’s Chocos Crunchy Cereal', price: 165, mrp: 190, unit: '375 g', tags: ['breakfast', 'baby_care'] },
          { name: 'Saffola Masala Oats Veggie Twist', price: 175, mrp: 200, unit: '500 g', tags: ['breakfast', 'fitness_nutrition', 'office_snacks'] },
          { name: 'Kellogg’s Muesli Almond & Raisins', price: 320, mrp: 375, unit: '500 g', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Nestlé Koko Krunch Chocolate Cereal', price: 180, mrp: 210, unit: '350 g', tags: ['breakfast', 'baby_care'] },
          { name: 'MuscleBlaze High Protein Oats 1kg', price: 449, mrp: 549, unit: '1 kg', tags: ['fitness_nutrition'] },
          { name: 'True Elements Gluten-Free Rolled Oats', price: 210, mrp: 250, unit: '500 g', tags: ['fitness_nutrition', 'breakfast'] },
          { name: 'Yogabar Dark Chocolate Oats', price: 235, mrp: 280, unit: '400 g', tags: ['breakfast', 'late_night_cravings'] },
          { name: 'Kellogg’s Almond & Honey Corn Flakes', price: 220, mrp: 255, unit: '300 g', tags: ['breakfast'] },
          { name: 'Bagrry’s Organic White Oats', price: 160, mrp: 190, unit: '500 g', tags: ['fitness_nutrition', 'breakfast'] },
          { name: 'Soulfull Ragi Chocos Cereal', price: 145, mrp: 175, unit: '250 g', tags: ['breakfast', 'baby_care'] },
          { name: 'Saffola Peppy Tomato Masala Oats', price: 170, mrp: 195, unit: '500 g', tags: ['office_snacks', 'breakfast'] },
          { name: 'Pintola Dark Chocolate Peanut Butter Oats', price: 299, mrp: 350, unit: '400 g', tags: ['fitness_nutrition', 'late_night_cravings'] },
          { name: 'Quaker Multigrain Oats', price: 210, mrp: 240, unit: '600 g', tags: ['fitness_nutrition', 'breakfast'] },
          { name: 'Alpino High Protein Super Muesli', price: 349, mrp: 420, unit: '400 g', tags: ['fitness_nutrition'] },
          { name: 'MTR Breakfast Instant Upma Mix', price: 75, mrp: 90, unit: '500 g', tags: ['breakfast', 'office_snacks'] },
        ],
      },
    ],
  },
  {
    name: 'Bakery & Biscuits',
    slug: 'bakery-biscuits',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    subcategories: [
      {
        name: 'Bread & Buns',
        slug: 'bread-buns',
        products: [
          { name: 'Modern Whole Wheat Bread 400g', price: 45, mrp: 50, unit: '400 g', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Britannia White Sandwich Bread', price: 40, mrp: 45, unit: '400 g', tags: ['breakfast'] },
          { name: 'English Oven Garlic Bread Stick', price: 65, mrp: 75, unit: '200 g', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Harvest Gold Brown Bread', price: 48, mrp: 55, unit: '400 g', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Amul Pasteurized Butter 100g', price: 56, mrp: 60, unit: '100 g', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Nutella Hazelnut Cocoa Spread 350g', price: 380, mrp: 420, unit: '350 g', tags: ['breakfast', 'late_night_cravings'] },
          { name: 'Harvest Gold Multigrain Bread', price: 55, mrp: 65, unit: '400 g', tags: ['fitness_nutrition', 'breakfast'] },
          { name: 'English Oven Soft Burger Buns (4 pcs)', price: 40, mrp: 48, unit: '200 g', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Modern Fruit Bread', price: 35, mrp: 42, unit: '250 g', tags: ['breakfast', 'office_snacks'] },
          { name: 'Britannia Fresh Pav Buns (6 pcs)', price: 30, mrp: 35, unit: '200 g', tags: ['dinner_prep', 'movie_night'] },
          { name: 'Bonn Atta Whole Wheat Bread', price: 42, mrp: 48, unit: '400 g', tags: ['breakfast'] },
          { name: 'The Whole Truth Creamy Peanut Butter', price: 299, mrp: 350, unit: '350 g', tags: ['fitness_nutrition', 'breakfast'] },
          { name: 'English Oven Thin Crust Pizza Base (2 pcs)', price: 45, mrp: 55, unit: '200 g', tags: ['movie_night'] },
          { name: 'Modern Premium Sandwich Bread', price: 50, mrp: 58, unit: '500 g', tags: ['breakfast'] },
          { name: 'Harvest Gold Garlic Herb Loaf', price: 70, mrp: 85, unit: '250 g', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Britannia Sweet Milk Bread', price: 42, mrp: 48, unit: '350 g', tags: ['breakfast'] },
          { name: 'Amul Garlic & Herb Spreadable Butter', price: 68, mrp: 75, unit: '100 g', tags: ['movie_night', 'breakfast'] },
          { name: 'Nutella Mini Hazelnut Spread 35g', price: 50, mrp: 60, unit: '35 g', tags: ['office_snacks', 'late_night_cravings'] },
        ],
      },
      {
        name: 'Cookies & Biscuits',
        slug: 'cookies-biscuits',
        products: [
          { name: 'Good Day Cashew Cookies 120g', price: 30, mrp: 35, unit: '120 g', tags: ['guest_arrival', 'office_snacks'] },
          { name: 'Britannia Bourbon Biscuit 150g', price: 25, mrp: 30, unit: '150 g', tags: ['movie_night', 'office_snacks', 'late_night_cravings'] },
          { name: 'Hide & Seek Chocolate Chip Biscuits', price: 40, mrp: 45, unit: '120 g', tags: ['movie_night', 'late_night_cravings'] },
          { name: 'Oreo Original Chocolate Cream Biscuits', price: 35, mrp: 40, unit: '120 g', tags: ['movie_night', 'baby_care', 'late_night_cravings'] },
          { name: 'Parle-G Gold Biscuits 1kg Pack', price: 110, mrp: 125, unit: '1 kg', tags: ['monthly_grocery', 'office_snacks'] },
          { name: 'Sunfeast Dark Fantasy Choco Fills', price: 45, mrp: 50, unit: '75 g', tags: ['late_night_cravings', 'guest_arrival'] },
          { name: 'Monaco Salted Biscuits 200g', price: 30, mrp: 35, unit: '200 g', tags: ['guest_arrival', 'office_snacks'] },
          { name: 'Krackjack Sweet & Salty Biscuits', price: 25, mrp: 30, unit: '150 g', tags: ['office_snacks', 'guest_arrival'] },
          { name: 'Unibic Premium Butter Cookies', price: 65, mrp: 75, unit: '150 g', tags: ['guest_arrival', 'office_snacks'] },
          { name: 'NutriChoice High Fibre Digestive Biscuits', price: 60, mrp: 70, unit: '200 g', tags: ['fitness_nutrition', 'monthly_grocery'] },
          { name: 'McVitie’s Original Digestive Biscuits', price: 75, mrp: 85, unit: '250 g', tags: ['fitness_nutrition', 'guest_arrival'] },
          { name: 'Britannia Nice Time Sugar Sprinkled Biscuits', price: 20, mrp: 25, unit: '100 g', tags: ['office_snacks'] },
          { name: 'Sunfeast Mom’s Magic Cashew & Almond', price: 35, mrp: 40, unit: '120 g', tags: ['guest_arrival', 'office_snacks'] },
          { name: 'Bisk Farm Choco Chip Cookies', price: 45, mrp: 55, unit: '150 g', tags: ['movie_night', 'office_snacks'] },
          { name: 'Parle Hide & Seek Fab Strawberry Cream', price: 30, mrp: 35, unit: '100 g', tags: ['late_night_cravings'] },
          { name: 'Britannia Tiger Crunch Choco Biscuits', price: 15, mrp: 20, unit: '100 g', tags: ['baby_care', 'office_snacks'] },
          { name: 'Anmol Yummy Butter Cookies', price: 25, mrp: 30, unit: '120 g', tags: ['guest_arrival'] },
          { name: 'Cadbury Oreo Choco Dipped Cookie', price: 60, mrp: 70, unit: '96 g', tags: ['late_night_cravings', 'movie_night'] },
        ],
      },
      {
        name: 'Cakes & Rusks',
        slug: 'cakes-rusks',
        products: [
          { name: 'Winkies Chocolate Swiss Roll Cake', price: 35, mrp: 40, unit: '60 g', tags: ['late_night_cravings', 'office_snacks'] },
          { name: 'Britannia Gobbles Chocolate Cake Roll', price: 40, mrp: 45, unit: '65 g', tags: ['late_night_cravings', 'baby_care'] },
          { name: 'Bauli Moonfils Vanilla Cream Roll', price: 25, mrp: 30, unit: '45 g', tags: ['office_snacks', 'late_night_cravings'] },
          { name: 'Britannia Toastea Premium Milk Rusk 300g', price: 55, mrp: 60, unit: '300 g', tags: ['office_snacks', 'guest_arrival', 'monthly_grocery'] },
          { name: 'Parle Real Elaichi Rusk', price: 45, mrp: 50, unit: '300 g', tags: ['office_snacks', 'guest_arrival'] },
          { name: 'Elite Rich Plum Cake 250g', price: 140, mrp: 160, unit: '250 g', tags: ['guest_arrival', 'late_night_cravings'] },
          { name: 'Winkies Soft Marble Slice Cake', price: 30, mrp: 35, unit: '50 g', tags: ['office_snacks'] },
          { name: 'Bauli Choco Soft Bun Fill', price: 25, mrp: 30, unit: '45 g', tags: ['office_snacks', 'late_night_cravings'] },
          { name: 'Britannia Pineapple Slice Cake Pack', price: 35, mrp: 40, unit: '60 g', tags: ['office_snacks'] },
          { name: 'Elite Chocolate Sponge Cake 200g', price: 99, mrp: 120, unit: '200 g', tags: ['guest_arrival', 'late_night_cravings'] },
          { name: 'Harvest Gold Crispy Fruit Rusk', price: 50, mrp: 60, unit: '250 g', tags: ['office_snacks'] },
          { name: 'Winkies Red Velvet Cupcake (2 pcs)', price: 45, mrp: 55, unit: '70 g', tags: ['late_night_cravings'] },
          { name: 'Britannia Chocolate Muffins Pack', price: 50, mrp: 60, unit: '90 g', tags: ['late_night_cravings', 'baby_care'] },
          { name: 'English Oven Garlic Butter Toast Rusk', price: 60, mrp: 70, unit: '200 g', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Winkies Fresh Banana Slice Cake', price: 30, mrp: 35, unit: '50 g', tags: ['office_snacks', 'breakfast'] },
          { name: 'Bauli Strawberry Cream Moonfils', price: 25, mrp: 30, unit: '45 g', tags: ['late_night_cravings'] },
          { name: 'Elite Butter Sponge Cake', price: 89, mrp: 105, unit: '200 g', tags: ['guest_arrival'] },
          { name: 'Parle Premium Wheat Toast Rusk', price: 48, mrp: 55, unit: '300 g', tags: ['office_snacks', 'monthly_grocery'] },
        ],
      },
    ],
  },
  {
    name: 'Munchies & Snacks',
    slug: 'munchies-snacks',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
    subcategories: [
      {
        name: 'Chips & Namkeen',
        slug: 'chips-namkeen',
        products: [
          { name: 'Lay’s India’s Magic Masala Chips 50g', price: 20, mrp: 20, unit: '50 g', tags: ['movie_night', 'guest_arrival', 'late_night_cravings'] },
          { name: 'Haldiram’s Aloo Bhujia 200g', price: 55, mrp: 60, unit: '200 g', tags: ['guest_arrival', 'movie_night', 'monthly_grocery'] },
          { name: 'Kurkure Masala Munch 90g', price: 20, mrp: 20, unit: '90 g', tags: ['movie_night', 'office_snacks'] },
          { name: 'Bingo Mad Angles Aachari Masti', price: 20, mrp: 20, unit: '66 g', tags: ['movie_night', 'office_snacks'] },
          { name: 'Uncle Chipps Spicy Treat Potato Chips', price: 20, mrp: 20, unit: '50 g', tags: ['movie_night'] },
          { name: 'Haldiram’s Khatta Meetha Mixture 200g', price: 50, mrp: 55, unit: '200 g', tags: ['guest_arrival', 'monthly_grocery'] },
          { name: 'Pringles Sour Cream & Onion 107g', price: 115, mrp: 135, unit: '107 g', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Doritos Nacho Cheese Tortilla Chips', price: 50, mrp: 60, unit: '82 g', tags: ['movie_night', 'late_night_cravings'] },
          { name: 'Cornitos Cheese & Herbs Nachos', price: 60, mrp: 70, unit: '150 g', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Bikaji Bikaneri Bhujia 200g', price: 58, mrp: 65, unit: '200 g', tags: ['guest_arrival', 'monthly_grocery'] },
          { name: 'Haldiram’s Salted Moong Dal 200g', price: 52, mrp: 60, unit: '200 g', tags: ['guest_arrival', 'office_snacks'] },
          { name: 'Balaji Wafers Simply Salted Chips', price: 20, mrp: 20, unit: '65 g', tags: ['movie_night'] },
          { name: 'Lay’s American Style Cream & Onion', price: 20, mrp: 20, unit: '50 g', tags: ['movie_night', 'office_snacks'] },
          { name: 'Kurkure Solid Masti Twisteez', price: 20, mrp: 20, unit: '85 g', tags: ['movie_night'] },
          { name: 'Bingo Tedhe Medhe Masala Tadka', price: 20, mrp: 20, unit: '90 g', tags: ['movie_night', 'office_snacks'] },
          { name: 'Haldiram’s Navratan Mix Namkeen', price: 55, mrp: 62, unit: '200 g', tags: ['guest_arrival', 'monthly_grocery'] },
          { name: 'Too Yumm Karare Munchy Chips', price: 20, mrp: 20, unit: '70 g', tags: ['movie_night', 'fitness_nutrition'] },
          { name: 'Bikaji Tasty Nut Peanut Snack', price: 45, mrp: 50, unit: '150 g', tags: ['guest_arrival', 'office_snacks'] },
        ],
      },
      {
        name: 'Chocolates',
        slug: 'chocolates',
        products: [
          { name: 'Cadbury Dairy Milk Silk Hazelnut 60g', price: 90, mrp: 100, unit: '60 g', tags: ['movie_night', 'late_night_cravings'] },
          { name: 'KitKat 4 Finger Chocolate Bar', price: 30, mrp: 35, unit: '38 g', tags: ['office_snacks', 'late_night_cravings'] },
          { name: 'Snickers Peanut Chocolate Bar 45g', price: 40, mrp: 50, unit: '45 g', tags: ['fitness_nutrition', 'office_snacks'] },
          { name: 'Ferrero Rocher Chocolate Box (4 pcs)', price: 149, mrp: 175, unit: '50 g', tags: ['guest_arrival', 'late_night_cravings'] },
          { name: 'Amul 55% Dark Chocolate Bar 150g', price: 110, mrp: 130, unit: '150 g', tags: ['fitness_nutrition', 'late_night_cravings'] },
          { name: 'Milkybar White Chocolate Bar', price: 20, mrp: 20, unit: '26 g', tags: ['baby_care', 'late_night_cravings'] },
          { name: 'Cadbury 5 Star Chocolate Bar', price: 20, mrp: 20, unit: '32 g', tags: ['office_snacks'] },
          { name: 'Nestlé Munch Crunchy Wafer Bar', price: 15, mrp: 15, unit: '25 g', tags: ['office_snacks'] },
          { name: 'Cadbury Dairy Milk Shots Pack', price: 20, mrp: 20, unit: '36.8 g', tags: ['movie_night', 'office_snacks'] },
          { name: 'Hershey’s Kisses Milk Chocolate Pack', price: 65, mrp: 75, unit: '33 g', tags: ['late_night_cravings', 'guest_arrival'] },
          { name: 'Lindt Excellence 70% Cocoa Dark Bar', price: 299, mrp: 350, unit: '100 g', tags: ['fitness_nutrition', 'late_night_cravings'] },
          { name: 'Cadbury Fuse Peanut & Caramel Bar', price: 35, mrp: 40, unit: '45 g', tags: ['office_snacks', 'late_night_cravings'] },
          { name: 'Toblerone Swiss Milk Chocolate 100g', price: 195, mrp: 230, unit: '100 g', tags: ['guest_arrival', 'late_night_cravings'] },
          { name: 'Kinder Joy Chocolate with Toy', price: 45, mrp: 50, unit: '20 g', tags: ['baby_care'] },
          { name: 'Bounty Coconut Filled Chocolate Bar', price: 55, mrp: 65, unit: '57 g', tags: ['late_night_cravings'] },
          { name: 'Mars Chocolate Caramel Bar 51g', price: 50, mrp: 60, unit: '51 g', tags: ['late_night_cravings'] },
          { name: 'Galaxy Smooth Milk Chocolate Bar', price: 60, mrp: 70, unit: '40 g', tags: ['late_night_cravings'] },
          { name: 'Twix Caramel Cookie Chocolate Twin Bar', price: 50, mrp: 60, unit: '50 g', tags: ['office_snacks', 'late_night_cravings'] },
        ],
      },
      {
        name: 'Frozen Snacks',
        slug: 'frozen-snacks',
        products: [
          { name: 'McCain Veggie Nuggets 325g', price: 130, mrp: 150, unit: '325 g', tags: ['movie_night', 'guest_arrival'] },
          { name: 'ITC Master Chef Chicken Nuggets 250g', price: 180, mrp: 210, unit: '250 g', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Sumeru Crispy Frozen French Fries 450g', price: 110, mrp: 130, unit: '450 g', tags: ['movie_night', 'guest_arrival'] },
          { name: 'McCain Smileys Potato Crisps 375g', price: 145, mrp: 165, unit: '375 g', tags: ['movie_night', 'baby_care'] },
          { name: 'Venky’s Crispy Chicken Popcorn 250g', price: 199, mrp: 230, unit: '250 g', tags: ['movie_night', 'late_night_cravings'] },
          { name: 'Prasuma Authentic Pork Momos (10 pcs)', price: 275, mrp: 320, unit: '250 g', tags: ['late_night_cravings', 'movie_night'] },
          { name: 'Godrej Yummiez Cheese Corn Nuggets', price: 155, mrp: 180, unit: '250 g', tags: ['guest_arrival', 'movie_night'] },
          { name: 'McCain Veggie Burger Patty (4 pcs)', price: 125, mrp: 145, unit: '360 g', tags: ['movie_night', 'breakfast'] },
          { name: 'Sumeru Flaky Malabar Paratha (5 pcs)', price: 120, mrp: 140, unit: '400 g', tags: ['dinner_prep', 'breakfast'] },
          { name: 'ITC Master Chef Hot Spicy Wings', price: 230, mrp: 270, unit: '300 g', tags: ['movie_night', 'late_night_cravings'] },
          { name: 'McCain Chilli Garlic Potato Bites', price: 135, mrp: 155, unit: '350 g', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Venky’s Chicken Breakfast Sausage', price: 195, mrp: 225, unit: '250 g', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Prasuma Spicy Chicken Momos (10 pcs)', price: 245, mrp: 285, unit: '250 g', tags: ['late_night_cravings', 'movie_night'] },
          { name: 'Godrej Yummiez Crispy Chicken Nuggets', price: 185, mrp: 215, unit: '250 g', tags: ['movie_night'] },
          { name: 'McCain Aloo Tikki Mazedaar (4 pcs)', price: 95, mrp: 110, unit: '280 g', tags: ['guest_arrival', 'dinner_prep'] },
          { name: 'Sumeru Veg Spring Rolls (8 pcs)', price: 140, mrp: 165, unit: '240 g', tags: ['guest_arrival', 'movie_night'] },
          { name: 'Prasuma Veg Vegetable Momos (10 pcs)', price: 199, mrp: 235, unit: '250 g', tags: ['movie_night', 'late_night_cravings'] },
          { name: 'Venky’s Chicken Seekh Kebab 250g', price: 220, mrp: 255, unit: '250 g', tags: ['dinner_prep', 'guest_arrival'] },
        ],
      },
    ],
  },
  {
    name: 'Cold Drinks, Tea & Coffee',
    slug: 'cold-drinks-tea-coffee',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    subcategories: [
      {
        name: 'Soft Drinks & Juices',
        slug: 'soft-drinks-juices',
        products: [
          { name: 'Coca-Cola Soft Drink Original 750ml', price: 40, mrp: 45, unit: '750 ml', tags: ['movie_night', 'guest_arrival', 'late_night_cravings'] },
          { name: 'Pepsi Carbonated Soft Drink 750ml', price: 40, mrp: 45, unit: '750 ml', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Sprite Lemon Lime Soft Drink 750ml', price: 40, mrp: 45, unit: '750 ml', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Thums Up Charged Soft Drink 750ml', price: 40, mrp: 45, unit: '750 ml', tags: ['movie_night', 'late_night_cravings'] },
          { name: 'Real Fruit Power Mixed Fruit Juice 1L', price: 110, mrp: 130, unit: '1 L', tags: ['breakfast', 'guest_arrival', 'monthly_grocery'] },
          { name: 'Tropicana 100% Orange Juice 1L', price: 135, mrp: 155, unit: '1 L', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Red Bull Energy Drink Can 250ml', price: 125, mrp: 125, unit: '250 ml', tags: ['office_snacks', 'late_night_cravings'] },
          { name: 'Monster Energy Drink 350ml Can', price: 110, mrp: 125, unit: '350 ml', tags: ['office_snacks', 'fitness_nutrition'] },
          { name: 'Paper Boat Aamras Mango Juice 200ml', price: 35, mrp: 40, unit: '200 ml', tags: ['guest_arrival', 'breakfast'] },
          { name: 'Frooti Mango Drink 1.2L Bottle', price: 65, mrp: 75, unit: '1.2 L', tags: ['guest_arrival', 'movie_night'] },
          { name: 'Maaza Mango Drink 1.2L Bottle', price: 68, mrp: 78, unit: '1.2 L', tags: ['guest_arrival', 'movie_night'] },
          { name: 'Appy Fizz Sparkling Apple Juice Can', price: 30, mrp: 35, unit: '250 ml', tags: ['movie_night', 'office_snacks'] },
          { name: 'Fanta Orange Flavoured Soft Drink', price: 40, mrp: 45, unit: '750 ml', tags: ['movie_night', 'guest_arrival'] },
          { name: 'Mountain Dew Soft Drink 750ml', price: 40, mrp: 45, unit: '750 ml', tags: ['movie_night'] },
          { name: 'Schweppes Indian Tonic Water Can', price: 55, mrp: 65, unit: '300 ml', tags: ['guest_arrival', 'late_night_cravings'] },
          { name: 'Bira 91 Spicy Ginger Ale 300ml Can', price: 60, mrp: 70, unit: '300 ml', tags: ['guest_arrival', 'movie_night'] },
          { name: 'Ocean Fruit Water Peach 500ml', price: 50, mrp: 60, unit: '500 ml', tags: ['fitness_nutrition'] },
          { name: 'Raw Pressery Tender Coconut Water', price: 65, mrp: 80, unit: '200 ml', tags: ['fitness_nutrition', 'breakfast'] },
        ],
      },
      {
        name: 'Tea & Coffee',
        slug: 'tea-coffee',
        products: [
          { name: 'Tata Tea Gold Premium Black Tea 250g', price: 160, mrp: 180, unit: '250 g', tags: ['breakfast', 'guest_arrival', 'office_snacks', 'monthly_grocery'] },
          { name: 'Nescafé Classic Instant Coffee 50g', price: 195, mrp: 220, unit: '50 g', tags: ['breakfast', 'guest_arrival', 'office_snacks'] },
          { name: 'Brooke Bond Red Label Tea 500g', price: 280, mrp: 310, unit: '500 g', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Society Leaf Tea 250g', price: 155, mrp: 175, unit: '250 g', tags: ['breakfast', 'office_snacks'] },
          { name: 'Taj Mahal Premium Leaf Tea 250g', price: 210, mrp: 240, unit: '250 g', tags: ['guest_arrival', 'breakfast'] },
          { name: 'Nescafé Gold Blend Freeze Dried Coffee', price: 550, mrp: 625, unit: '100 g', tags: ['guest_arrival', 'office_snacks'] },
          { name: 'Bru Instant Coffee 100g Pouch', price: 185, mrp: 210, unit: '100 g', tags: ['breakfast', 'office_snacks'] },
          { name: 'Sleepy Owl Cold Brew Coffee Pack', price: 349, mrp: 400, unit: '5 brews', tags: ['office_snacks', 'late_night_cravings'] },
          { name: 'Blue Tokai Dark Roasted Coffee Beans', price: 440, mrp: 500, unit: '250 g', tags: ['guest_arrival', 'office_snacks'] },
          { name: 'Wagh Bakri Premium CTC Tea 500g', price: 260, mrp: 290, unit: '500 g', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Organic India Tulsi Green Tea 25 Dip Bags', price: 185, mrp: 215, unit: '25 bags', tags: ['fitness_nutrition', 'office_snacks'] },
          { name: 'Tetley Lemon & Honey Green Tea 30 Bags', price: 190, mrp: 220, unit: '30 bags', tags: ['fitness_nutrition', 'breakfast'] },
          { name: 'Rage Coffee Hazelnut Flavoured Instant Coffee', price: 299, mrp: 349, unit: '50 g', tags: ['office_snacks', 'late_night_cravings'] },
          { name: 'Continental Xtra South Indian Filter Coffee', price: 165, mrp: 190, unit: '200 g', tags: ['breakfast', 'guest_arrival'] },
          { name: 'Girnar Instant Premix Masala Tea (10 sachets)', price: 160, mrp: 180, unit: '140 g', tags: ['office_snacks', 'breakfast'] },
          { name: 'Tata Tea Premium Desh Ki Chai 500g', price: 250, mrp: 280, unit: '500 g', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Twinings Earl Grey Black Tea Bags (25s)', price: 340, mrp: 390, unit: '25 bags', tags: ['guest_arrival', 'office_snacks'] },
          { name: 'Davidoff Rich Aroma Instant Coffee 100g', price: 620, mrp: 720, unit: '100 g', tags: ['guest_arrival'] },
        ],
      },
      {
        name: 'Health Drinks',
        slug: 'health-drinks',
        products: [
          { name: 'Horlicks Classic Malt Health Drink 500g', price: 245, mrp: 275, unit: '500 g', tags: ['breakfast', 'monthly_grocery', 'baby_care'] },
          { name: 'Boost Chocolate Health Drink 500g', price: 255, mrp: 285, unit: '500 g', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Complan Chocolate Health Drink 500g', price: 270, mrp: 300, unit: '500 g', tags: ['breakfast', 'baby_care'] },
          { name: 'Bournvita Pro-Health Chocolate Drink', price: 230, mrp: 260, unit: '500 g', tags: ['breakfast', 'baby_care'] },
          { name: 'Ensure Adult Complete Nutrition Powder', price: 680, mrp: 750, unit: '400 g', tags: ['monthly_grocery', 'fitness_nutrition'] },
          { name: 'Protinex Rich Chocolate Health Drink', price: 620, mrp: 690, unit: '400 g', tags: ['fitness_nutrition', 'monthly_grocery'] },
          { name: 'Pediasure Premium Chocolate Powder', price: 740, mrp: 820, unit: '400 g', tags: ['baby_care'] },
          { name: 'MuscleBlaze Raw Whey Protein 1kg', price: 1899, mrp: 2399, unit: '1 kg', tags: ['fitness_nutrition'] },
          { name: 'Optimum Nutrition ON Gold Standard Whey 1lb', price: 2199, mrp: 2699, unit: '453 g', tags: ['fitness_nutrition'] },
          { name: 'Fast&Up Reload Electrolyte Orange Tablets', price: 290, mrp: 340, unit: '20 tabs', tags: ['fitness_nutrition'] },
          { name: 'Kapiva Pure Organic Aloe Vera Juice 1L', price: 299, mrp: 360, unit: '1 L', tags: ['fitness_nutrition'] },
          { name: 'Dabur 100% Pure Honey 500g', price: 210, mrp: 245, unit: '500 g', tags: ['breakfast', 'fitness_nutrition', 'monthly_grocery'] },
          { name: 'Saffola FITTIFY Green Coffee Mix', price: 240, mrp: 290, unit: '15 sachets', tags: ['fitness_nutrition', 'office_snacks'] },
          { name: 'Baidyanath Chyawanprash Special 1kg', price: 380, mrp: 430, unit: '1 kg', tags: ['monthly_grocery', 'fitness_nutrition'] },
          { name: 'Zandu Kesari Jivan Chyawanprash 900g', price: 490, mrp: 560, unit: '900 g', tags: ['fitness_nutrition'] },
          { name: 'Himalaya Organic Ashwagandha Tablets', price: 199, mrp: 240, unit: '60 tabs', tags: ['fitness_nutrition'] },
          { name: 'Nutrilite Daily Multivitamin Supplement', price: 890, mrp: 990, unit: '120 tabs', tags: ['fitness_nutrition'] },
          { name: 'MuscleBlaze Unflavored Creatine Monohydrate', price: 499, mrp: 649, unit: '100 g', tags: ['fitness_nutrition'] },
        ],
      },
    ],
  },
  {
    name: 'Atta, Rice, Dal & Masala',
    slug: 'atta-rice-dal-masala',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    subcategories: [
      {
        name: 'Flours & Grains',
        slug: 'flours-grains',
        products: [
          { name: 'Aashirvaad Shuddh Chakki Atta 5kg', price: 210, mrp: 245, unit: '5 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Fortune Everyday Basmati Rice 1kg', price: 145, mrp: 170, unit: '1 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'India Gate Rozana Basmati Rice 5kg', price: 425, mrp: 490, unit: '5 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Fortune Multigrain Atta 5kg', price: 260, mrp: 295, unit: '5 kg', tags: ['fitness_nutrition', 'monthly_grocery'] },
          { name: 'Pillsbury Chakki Fresh Whole Wheat Atta', price: 215, mrp: 250, unit: '5 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Daawat Biryani Premium Basmati Rice', price: 230, mrp: 270, unit: '1 kg', tags: ['dinner_prep', 'guest_arrival'] },
          { name: 'Tata Sampann Protein Rich Besan 500g', price: 65, mrp: 75, unit: '500 g', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'MTR Fine Rava Sooji 500g', price: 42, mrp: 50, unit: '500 g', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Rajdhani Premium Sooji 500g', price: 38, mrp: 45, unit: '500 g', tags: ['breakfast', 'monthly_grocery'] },
          { name: 'Aashirvaad Select Sharbati Wheat Atta 5kg', price: 285, mrp: 330, unit: '5 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Lal Qilla Majestic Basmati Rice 1kg', price: 185, mrp: 215, unit: '1 kg', tags: ['dinner_prep', 'guest_arrival'] },
          { name: 'Bagrry’s Organic White Oats 500g', price: 160, mrp: 190, unit: '500 g', tags: ['breakfast', 'fitness_nutrition'] },
          { name: 'Fortune Premium Suji 500g', price: 40, mrp: 48, unit: '500 g', tags: ['breakfast'] },
          { name: 'Nature Fresh Sampoorna Atta 5kg', price: 199, mrp: 235, unit: '5 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Organic Tattva Organic Whole Wheat Atta 5kg', price: 310, mrp: 360, unit: '5 kg', tags: ['fitness_nutrition', 'monthly_grocery'] },
          { name: 'Kohinoor Super Value Basmati Rice 1kg', price: 130, mrp: 155, unit: '1 kg', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Tata Sampann Fine Rice Flour 500g', price: 48, mrp: 55, unit: '500 g', tags: ['breakfast', 'dinner_prep'] },
          { name: 'Rajdhani Fine Maida Flour 500g', price: 35, mrp: 40, unit: '500 g', tags: ['late_night_cravings', 'guest_arrival'] },
        ],
      },
      {
        name: 'Pulses & Dal',
        slug: 'pulses-dal',
        products: [
          { name: 'Tata Sampann Unpolished Toor Dal 1kg', price: 165, mrp: 190, unit: '1 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Fortune Arhar Toor Dal 1kg', price: 160, mrp: 185, unit: '1 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Tata Sampann Unpolished Moong Dal 1kg', price: 150, mrp: 175, unit: '1 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Organic Tattva Organic Chana Dal 1kg', price: 135, mrp: 160, unit: '1 kg', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Rajdhani Premium Kabuli Chana 1kg', price: 175, mrp: 200, unit: '1 kg', tags: ['dinner_prep', 'guest_arrival'] },
          { name: 'Fortune Rajma Chitra Red Beans 1kg', price: 170, mrp: 195, unit: '1 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Tata Sampann Unpolished Masoor Dal 1kg', price: 125, mrp: 145, unit: '1 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Fortune Urad Dal Whole Black 1kg', price: 180, mrp: 210, unit: '1 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Organic Tattva Green Moong Whole 500g', price: 90, mrp: 110, unit: '500 g', tags: ['fitness_nutrition', 'breakfast'] },
          { name: 'Rajdhani Small Black Chana 1kg', price: 115, mrp: 135, unit: '1 kg', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Tata Sampann Kala Chana Unpolished 1kg', price: 120, mrp: 140, unit: '1 kg', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Fortune Moong Chilka Split Dal 1kg', price: 155, mrp: 180, unit: '1 kg', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Organic Tattva White Lobia Cowpeas 500g', price: 85, mrp: 100, unit: '500 g', tags: ['fitness_nutrition', 'dinner_prep'] },
          { name: 'Rajdhani White Safed Matar 1kg', price: 95, mrp: 115, unit: '1 kg', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Tata Sampann Matar Dal 1kg', price: 90, mrp: 105, unit: '1 kg', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fortune Yellow Chana Dal 1kg', price: 130, mrp: 150, unit: '1 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Organic Tattva Premium Toor Dal 1kg', price: 195, mrp: 230, unit: '1 kg', tags: ['fitness_nutrition', 'monthly_grocery'] },
          { name: 'Rajdhani Moong Dhuli Yellow Dal 1kg', price: 148, mrp: 170, unit: '1 kg', tags: ['dinner_prep', 'monthly_grocery'] },
        ],
      },
      {
        name: 'Spices & Oils',
        slug: 'spices-oils',
        products: [
          { name: 'Fortune Sunlite Sunflower Oil 1L Pouch', price: 135, mrp: 155, unit: '1 L', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Everest Garam Masala Powder 100g', price: 85, mrp: 95, unit: '100 g', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'MDH Kitchen King All-in-One Masala', price: 82, mrp: 90, unit: '100 g', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Saffola Gold Blended Edible Cooking Oil 1L', price: 165, mrp: 190, unit: '1 L', tags: ['dinner_prep', 'fitness_nutrition', 'monthly_grocery'] },
          { name: 'Fortune Kachi Ghani Mustard Oil 1L Bottle', price: 145, mrp: 170, unit: '1 L', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Tata Salt Vacuum Evaporated Iodized Salt 1kg', price: 28, mrp: 30, unit: '1 kg', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Catch Red Chilli Powder (Lal Mirch) 100g', price: 65, mrp: 75, unit: '100 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Everest Turmeric Powder (Haldi) 100g', price: 42, mrp: 50, unit: '100 g', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'MDH Chunky Chat Masala 100g', price: 72, mrp: 80, unit: '100 g', tags: ['guest_arrival', 'movie_night'] },
          { name: 'Dabur Cold Pressed Mustard Oil 1L', price: 175, mrp: 200, unit: '1 L', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Fortune Physically Refined Rice Bran Oil 1L', price: 150, mrp: 175, unit: '1 L', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Everest Coriander Powder (Dhania) 100g', price: 45, mrp: 52, unit: '100 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'MDH Deggi Mirch Red Chilli Powder 100g', price: 95, mrp: 105, unit: '100 g', tags: ['dinner_prep', 'guest_arrival'] },
          { name: 'Tata Sampann Natural Turmeric Powder 100g', price: 48, mrp: 55, unit: '100 g', tags: ['dinner_prep', 'fitness_nutrition'] },
          { name: 'Catch Coriander Powder 100g', price: 44, mrp: 50, unit: '100 g', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Fortune Filtered Groundnut Oil 1L', price: 185, mrp: 215, unit: '1 L', tags: ['dinner_prep', 'monthly_grocery'] },
          { name: 'Everest Meat Spices Masala 100g', price: 90, mrp: 100, unit: '100 g', tags: ['dinner_prep', 'guest_arrival'] },
          { name: 'MDH Pav Bhaji Masala 100g', price: 78, mrp: 85, unit: '100 g', tags: ['dinner_prep', 'movie_night'] },
        ],
      },
    ],
  },
  {
    name: 'Cleaning Essentials',
    slug: 'cleaning-essentials',
    imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400',
    subcategories: [
      {
        name: 'Detergents',
        slug: 'detergents',
        products: [
          { name: 'Surf Excel Easy Wash Detergent Powder 1kg', price: 140, mrp: 160, unit: '1 kg', tags: ['house_cleaning', 'monthly_grocery'] },
          { name: 'Ariel Matic Top Load Washing Powder 1kg', price: 230, mrp: 260, unit: '1 kg', tags: ['house_cleaning', 'monthly_grocery'] },
          { name: 'Tide Plus Extra Power Detergent Powder 1kg', price: 125, mrp: 140, unit: '1 kg', tags: ['house_cleaning', 'monthly_grocery'] },
          { name: 'Surf Excel Matic Front Load Liquid Detergent 1L', price: 245, mrp: 280, unit: '1 L', tags: ['house_cleaning', 'monthly_grocery'] },
          { name: 'Rin Detergent Bar Soap (Pack of 4)', price: 40, mrp: 48, unit: '250 g x 4', tags: ['house_cleaning'] },
          { name: 'Comfort Fabric Conditioner Morning Fresh 860ml', price: 220, mrp: 250, unit: '860 ml', tags: ['house_cleaning', 'monthly_grocery'] },
          { name: 'Surf Excel Quick Wash Detergent Powder 1kg', price: 195, mrp: 220, unit: '1 kg', tags: ['house_cleaning'] },
          { name: 'Ariel Complete Washing Powder 1kg', price: 180, mrp: 205, unit: '1 kg', tags: ['house_cleaning'] },
          { name: 'Tide Jasmine & Rose Detergent Powder 1kg', price: 120, mrp: 135, unit: '1 kg', tags: ['house_cleaning'] },
          { name: 'Comfort Fabric After Wash Lily 860ml', price: 220, mrp: 250, unit: '860 ml', tags: ['house_cleaning'] },
          { name: 'Henko Matic Liquid Detergent 1L', price: 210, mrp: 245, unit: '1 L', tags: ['house_cleaning'] },
          { name: 'Vanish Oxi Action Stain Remover Powder 400g', price: 260, mrp: 295, unit: '400 g', tags: ['house_cleaning'] },
          { name: 'Rin Matic Detergent Powder 1kg', price: 145, mrp: 165, unit: '1 kg', tags: ['house_cleaning'] },
          { name: 'Surf Excel Detergent Bar Soap 250g', price: 28, mrp: 32, unit: '250 g', tags: ['house_cleaning'] },
          { name: 'Ariel Matic Front Load Washing Powder 1kg', price: 240, mrp: 275, unit: '1 kg', tags: ['house_cleaning'] },
          { name: 'Tide Naturals Lemon & Chandan Powder 1kg', price: 115, mrp: 130, unit: '1 kg', tags: ['house_cleaning'] },
          { name: 'Comfort Pink Lily Fabric Softener 860ml', price: 225, mrp: 255, unit: '860 ml', tags: ['house_cleaning'] },
          { name: 'Syclone Matic Top Load Detergent 1kg', price: 170, mrp: 200, unit: '1 kg', tags: ['house_cleaning'] },
        ],
      },
      {
        name: 'Cleaners & Fresheners',
        slug: 'cleaners-fresheners',
        products: [
          { name: 'Vim Dishwash Gel Lemon 500ml', price: 105, mrp: 120, unit: '500 ml', tags: ['house_cleaning', 'monthly_grocery'] },
          { name: 'Harpic Power Plus Toilet Cleaner 1L', price: 195, mrp: 220, unit: '1 L', tags: ['house_cleaning', 'monthly_grocery'] },
          { name: 'Lizol Floor Surface Cleaner Citrus 1L', price: 210, mrp: 240, unit: '1 L', tags: ['house_cleaning', 'monthly_grocery'] },
          { name: 'Dettol Disinfectant Sanitizer Spray 225ml', price: 160, mrp: 180, unit: '225 ml', tags: ['house_cleaning', 'personal_care'] },
          { name: 'Colin Glass and Surface Cleaner 500ml', price: 105, mrp: 120, unit: '500 ml', tags: ['house_cleaning'] },
          { name: 'Odonil Bathroom Air Freshener Blocks (4 Pack)', price: 160, mrp: 180, unit: '200 g', tags: ['house_cleaning', 'monthly_grocery'] },
          { name: 'Vim Dishwash Bar Soap 300g Pack', price: 35, mrp: 40, unit: '300 g', tags: ['house_cleaning'] },
          { name: 'Pril Lime Dishwash Liquid 500ml', price: 110, mrp: 125, unit: '500 ml', tags: ['house_cleaning'] },
          { name: 'Domex Fresh Guard Lime Toilet Cleaner 1L', price: 180, mrp: 205, unit: '1 L', tags: ['house_cleaning'] },
          { name: 'Godrej Aer Pocket Bathroom Freshener (3s)', price: 140, mrp: 160, unit: '30 g', tags: ['house_cleaning'] },
          { name: 'Harpic Bathroom Cleaner Liquid 1L', price: 190, mrp: 215, unit: '1 L', tags: ['house_cleaning'] },
          { name: 'Lizol Floral Floor Cleaner Liquid 1L', price: 210, mrp: 240, unit: '1 L', tags: ['house_cleaning'] },
          { name: 'Dettol Antiseptic Liquid Disinfectant 550ml', price: 215, mrp: 245, unit: '550 ml', tags: ['house_cleaning', 'personal_care'] },
          { name: 'Vim Matic Dishwasher All-in-1 Tablets (30s)', price: 499, mrp: 599, unit: '30 tabs', tags: ['house_cleaning'] },
          { name: 'Colin Surface Disinfectant Wipes 30s', price: 120, mrp: 140, unit: '30 wipes', tags: ['house_cleaning'] },
          { name: 'Odonil Room Air Freshener Spray 220ml', price: 145, mrp: 165, unit: '220 ml', tags: ['house_cleaning', 'guest_arrival'] },
          { name: 'Exo Touch Dishwash Bar 300g', price: 32, mrp: 38, unit: '300 g', tags: ['house_cleaning'] },
          { name: 'Lizol Lime Disinfectant Cleaner 1L', price: 210, mrp: 240, unit: '1 L', tags: ['house_cleaning'] },
        ],
      },
      {
        name: 'Disposables',
        slug: 'disposables',
        products: [
          { name: 'Origami Soft Paper Napkins (100 Sheets)', price: 55, mrp: 65, unit: '100 sheets', tags: ['house_cleaning', 'guest_arrival', 'movie_night'] },
          { name: 'Hindware 2-Ply Kitchen Towel Paper Roll', price: 99, mrp: 120, unit: '2 rolls', tags: ['house_cleaning', 'dinner_prep'] },
          { name: 'Solimo Food Grade Aluminum Foil 72m', price: 299, mrp: 350, unit: '72 m', tags: ['dinner_prep', 'house_cleaning'] },
          { name: 'Kleenex 2-Ply Soft Facial Tissues Box', price: 85, mrp: 100, unit: '100 tissues', tags: ['house_cleaning', 'personal_care'] },
          { name: 'Origami Eco-Friendly Garbage Bags Medium (30s)', price: 110, mrp: 130, unit: '30 bags', tags: ['house_cleaning', 'monthly_grocery'] },
          { name: 'Food Wrap Cling Film Packaging 30m', price: 125, mrp: 150, unit: '30 m', tags: ['dinner_prep', 'house_cleaning'] },
          { name: 'Solimo Non-Stick Parchment Baking Paper', price: 149, mrp: 180, unit: '20 m', tags: ['dinner_prep', 'meal_prep'] },
          { name: 'Origami Disposable Paper Drinking Cups (50s)', price: 95, mrp: 115, unit: '50 cups', tags: ['guest_arrival', 'office_snacks'] },
          { name: 'Papyrus Soft Toilet Paper Rolls (4 Pack)', price: 120, mrp: 140, unit: '4 rolls', tags: ['house_cleaning', 'personal_care'] },
          { name: 'Origami Multipurpose Wet Cleansing Wipes', price: 85, mrp: 100, unit: '80 wipes', tags: ['house_cleaning', 'personal_care'] },
          { name: 'Solimo Gentle Skin Wipes (80s Pack)', price: 99, mrp: 120, unit: '80 wipes', tags: ['personal_care', 'house_cleaning'] },
          { name: 'Origami Party Disposable Paper Plates (20s)', price: 85, mrp: 100, unit: '20 plates', tags: ['guest_arrival', 'movie_night'] },
          { name: 'Foodwrap Aluminum Foil Container with Lids (10s)', price: 110, mrp: 135, unit: '10 containers', tags: ['guest_arrival', 'dinner_prep'] },
          { name: 'Kleenex Compact Pocket Tissues (10 Packs)', price: 70, mrp: 85, unit: '10 packs', tags: ['personal_care'] },
          { name: 'Origami Biodegradable Paper Straws (100s)', price: 75, mrp: 95, unit: '100 straws', tags: ['guest_arrival', 'movie_night'] },
          { name: 'Solimo Heavy Duty Large Garbage Bags (15s)', price: 130, mrp: 155, unit: '15 bags', tags: ['house_cleaning'] },
          { name: 'Origami Soft 2-Ply Facial Tissues Pack', price: 79, mrp: 95, unit: '200 sheets', tags: ['personal_care'] },
          { name: 'Hindware Ultra Absorbent Kitchen Towel Rolls', price: 135, mrp: 160, unit: '4 rolls', tags: ['house_cleaning', 'dinner_prep'] },
        ],
      },
    ],
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    subcategories: [
      {
        name: 'Bath & Body',
        slug: 'bath-body',
        products: [
          { name: 'Dettol Original Bathing Soap (Pack of 4)', price: 160, mrp: 180, unit: '125 g x 4', tags: ['personal_care', 'monthly_grocery'] },
          { name: 'Dove Cream Beauty Bath Bar Soap 125g', price: 65, mrp: 72, unit: '125 g', tags: ['personal_care'] },
          { name: 'Nivea Body Wash Fresh Power Shower Gel', price: 199, mrp: 249, unit: '250 ml', tags: ['personal_care', 'fitness_nutrition'] },
          { name: 'Pears Soft & Fresh Bathing Soap (Pack of 3)', price: 150, mrp: 175, unit: '125 g x 3', tags: ['personal_care'] },
          { name: 'Fiama Gel Bar Peach & Avocado Soap (3s)', price: 170, mrp: 199, unit: '125 g x 3', tags: ['personal_care'] },
          { name: 'Lifebuoy Total 10 Antibacterial Soap 125g', price: 36, mrp: 40, unit: '125 g', tags: ['personal_care'] },
          { name: 'Pears Pure & Gentle Body Wash Shower Gel', price: 210, mrp: 250, unit: '250 ml', tags: ['personal_care'] },
          { name: 'Dettol Skincare Germ Protection Soap (4s)', price: 170, mrp: 190, unit: '125 g x 4', tags: ['personal_care'] },
          { name: 'Dove Deep Moisture Body Wash 250ml', price: 220, mrp: 260, unit: '250 ml', tags: ['personal_care'] },
          { name: 'Nivea Soft Light Moisturizing Cream 100ml', price: 160, mrp: 190, unit: '100 ml', tags: ['personal_care'] },
          { name: 'Fiama Blackcurrant & Bearberry Shower Gel', price: 185, mrp: 220, unit: '250 ml', tags: ['personal_care'] },
          { name: 'Biotique Bio Apricot Refreshing Body Wash', price: 145, mrp: 180, unit: '200 ml', tags: ['personal_care', 'fitness_nutrition'] },
          { name: 'Palmolive Thermal Spa Sea Salt Body Wash', price: 215, mrp: 260, unit: '250 ml', tags: ['personal_care'] },
          { name: 'Dettol Cool Menthol Refreshing Soap (4s)', price: 165, mrp: 185, unit: '125 g x 4', tags: ['personal_care', 'fitness_nutrition'] },
          { name: 'Lux Velvet Glow Jasmine Soap (Pack of 4)', price: 145, mrp: 165, unit: '125 g x 4', tags: ['personal_care'] },
          { name: 'Santoor Sandalwood & Turmeric Soap (4s)', price: 140, mrp: 160, unit: '125 g x 4', tags: ['personal_care'] },
          { name: 'Himalaya Purifying Neem Bathing Soap (4s)', price: 155, mrp: 175, unit: '125 g x 4', tags: ['personal_care', 'fitness_nutrition'] },
          { name: 'Old Spice Captain Refreshing Body Wash', price: 249, mrp: 299, unit: '250 ml', tags: ['personal_care', 'fitness_nutrition'] },
        ],
      },
      {
        name: 'Oral Care',
        slug: 'oral-care',
        products: [
          { name: 'Colgate Strong Teeth Toothpaste 200g', price: 95, mrp: 110, unit: '200 g', tags: ['personal_care', 'monthly_grocery'] },
          { name: 'Sensodyne Rapid Relief Sensitive Toothpaste', price: 195, mrp: 220, unit: '80 g', tags: ['personal_care', 'monthly_grocery'] },
          { name: 'Oral-B Soft Toothbrush (Pack of 3)', price: 85, mrp: 100, unit: '3 pcs', tags: ['personal_care', 'monthly_grocery'] },
          { name: 'Listerine Cool Mint Mouthwash 250ml', price: 145, mrp: 165, unit: '250 ml', tags: ['personal_care', 'monthly_grocery'] },
          { name: 'Pepsodent Germicheck Toothpaste 200g', price: 88, mrp: 100, unit: '200 g', tags: ['personal_care'] },
          { name: 'Close-Up Everfresh Red Hot Gel Toothpaste', price: 99, mrp: 115, unit: '150 g', tags: ['personal_care'] },
          { name: 'Dabur Red Herbal Toothpaste 200g', price: 105, mrp: 120, unit: '200 g', tags: ['personal_care', 'monthly_grocery'] },
          { name: 'Colgate MaxFresh Red Gel Toothpaste 150g', price: 105, mrp: 120, unit: '150 g', tags: ['personal_care'] },
          { name: 'Sensodyne Repair & Protect Toothpaste 100g', price: 240, mrp: 270, unit: '100 g', tags: ['personal_care'] },
          { name: 'Oral-B Charcoal Extra Soft Toothbrush (3s)', price: 110, mrp: 130, unit: '3 pcs', tags: ['personal_care'] },
          { name: 'Himalaya Complete Care Herbal Toothpaste', price: 90, mrp: 105, unit: '150 g', tags: ['personal_care'] },
          { name: 'Colgate Plax Peppermint Mouthwash 250ml', price: 140, mrp: 160, unit: '250 ml', tags: ['personal_care'] },
          { name: 'Dabur Meswak Herbal Toothpaste 200g', price: 110, mrp: 125, unit: '200 g', tags: ['personal_care'] },
          { name: 'Sensodyne Fresh Mint Toothpaste 100g', price: 180, mrp: 200, unit: '100 g', tags: ['personal_care'] },
          { name: 'Oral-B Vitality Electric Toothbrush', price: 1499, mrp: 1799, unit: '1 pc', tags: ['personal_care'] },
          { name: 'Colgate Total 12 Whole Mouth Protection', price: 160, mrp: 185, unit: '150 g', tags: ['personal_care'] },
          { name: 'Pepsodent Sensitive Expert Toothpaste', price: 150, mrp: 170, unit: '80 g', tags: ['personal_care'] },
          { name: 'Listerine Cavity Protection Mouthwash 250ml', price: 150, mrp: 170, unit: '250 ml', tags: ['personal_care'] },
        ],
      },
      {
        name: 'Skin & Hair Care',
        slug: 'skin-hair-care',
        products: [
          { name: 'Nivea Dark Spot Reduction Face Wash 100g', price: 185, mrp: 220, unit: '100 g', tags: ['personal_care'] },
          { name: 'Garnier Bright Complete Vitamin C Face Wash', price: 165, mrp: 195, unit: '100 g', tags: ['personal_care'] },
          { name: 'Parachute Advansed Coconut Hair Oil 300ml', price: 145, mrp: 165, unit: '300 ml', tags: ['personal_care', 'monthly_grocery'] },
          { name: 'Dove Intense Repair Shampoo 340ml', price: 260, mrp: 310, unit: '340 ml', tags: ['personal_care', 'monthly_grocery'] },
          { name: 'L’Oréal Paris Total Repair 5 Conditioner', price: 210, mrp: 245, unit: '175 ml', tags: ['personal_care'] },
          { name: 'Sunsilk Stunning Black Shine Shampoo 340ml', price: 220, mrp: 260, unit: '340 ml', tags: ['personal_care'] },
          { name: 'TRESemmé Keratin Smooth Shampoo 340ml', price: 290, mrp: 340, unit: '340 ml', tags: ['personal_care'] },
          { name: 'Himalaya Purifying Neem Face Wash 150ml', price: 175, mrp: 200, unit: '150 ml', tags: ['personal_care', 'fitness_nutrition'] },
          { name: 'Pond’s Super Light Gel Moisturizer 100g', price: 199, mrp: 240, unit: '100 g', tags: ['personal_care'] },
          { name: 'Vaseline Intensive Care Deep Moisture Lotion', price: 280, mrp: 330, unit: '400 ml', tags: ['personal_care', 'monthly_grocery'] },
          { name: 'Biotique Bio Kelp Protein Shampoo 200ml', price: 155, mrp: 190, unit: '200 ml', tags: ['personal_care', 'fitness_nutrition'] },
          { name: 'Mamaearth Onion Hair Oil with Redensyl', price: 399, mrp: 449, unit: '150 ml', tags: ['personal_care'] },
          { name: 'Plum Green Tea Pore Cleansing Face Wash', price: 299, mrp: 345, unit: '75 ml', tags: ['personal_care'] },
          { name: 'Nivea Sun Protect & Moisture SPF 50 Lotion', price: 380, mrp: 450, unit: '125 ml', tags: ['personal_care', 'fitness_nutrition'] },
          { name: 'Garnier Skin Naturals Micellar Cleansing Water', price: 225, mrp: 260, unit: '125 ml', tags: ['personal_care'] },
          { name: 'Pantene Hairfall Control Shampoo 340ml', price: 250, mrp: 295, unit: '340 ml', tags: ['personal_care'] },
          { name: 'Head & Shoulders Smooth & Silky Anti-Dandruff', price: 275, mrp: 320, unit: '340 ml', tags: ['personal_care'] },
          { name: 'Lakmé Absolute Perfect Radiance Skin Cream', price: 299, mrp: 360, unit: '50 g', tags: ['personal_care'] },
        ],
      },
    ],
  },
  {
    name: 'Baby Care',
    slug: 'baby-care',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
    subcategories: [
      {
        name: 'Diapers & Wipes',
        slug: 'diapers-wipes',
        products: [
          { name: 'Pampers All-round Protection Diapers M (44s)', price: 699, mrp: 799, unit: '44 count', tags: ['baby_care', 'monthly_grocery'] },
          { name: 'Huggies Wonder Pants Diapers L (42s)', price: 685, mrp: 799, unit: '42 count', tags: ['baby_care', 'monthly_grocery'] },
          { name: 'MamyPoko Pants Standard Diapers M (38s)', price: 549, mrp: 649, unit: '38 count', tags: ['baby_care'] },
          { name: 'Himalaya Gentle Baby Wipes (72s Pack)', price: 145, mrp: 175, unit: '72 wipes', tags: ['baby_care', 'monthly_grocery'] },
          { name: 'Pampers Fresh Baby Wipes with Aloe', price: 165, mrp: 199, unit: '64 wipes', tags: ['baby_care'] },
          { name: 'Johnson’s Baby Skincare Wipes (80s)', price: 180, mrp: 220, unit: '80 wipes', tags: ['baby_care'] },
          { name: 'Supples Baby Pants Diapers M (42s)', price: 499, mrp: 599, unit: '42 count', tags: ['baby_care'] },
          { name: 'LuvLap Paraben-Free Baby Wipes (72s)', price: 125, mrp: 155, unit: '72 wipes', tags: ['baby_care'] },
          { name: 'Baby Dove Rich Moisture Wipes (80s)', price: 190, mrp: 230, unit: '80 wipes', tags: ['baby_care'] },
          { name: 'Pampers Active Baby Pants Small (46s)', price: 650, mrp: 749, unit: '46 count', tags: ['baby_care'] },
          { name: 'Huggies Dry Pants Diapers Medium (50s)', price: 720, mrp: 849, unit: '50 count', tags: ['baby_care'] },
          { name: 'MamyPoko Pants Extra Absorb Large (34s)', price: 630, mrp: 749, unit: '34 count', tags: ['baby_care'] },
          { name: 'Himalaya Gentle Baby Diapers Medium (28s)', price: 380, mrp: 450, unit: '28 count', tags: ['baby_care'] },
          { name: 'Supples Premium Aloe Vera Wipes (80s)', price: 135, mrp: 165, unit: '80 wipes', tags: ['baby_care'] },
          { name: 'Johnson’s Baby Diaper Rash Cream 50g', price: 120, mrp: 140, unit: '50 g', tags: ['baby_care'] },
          { name: 'Pampers Premium Care Pants Diapers M (38s)', price: 899, mrp: 999, unit: '38 count', tags: ['baby_care'] },
          { name: 'Huggies Nature Care Organic Diapers M (32s)', price: 799, mrp: 899, unit: '32 count', tags: ['baby_care'] },
          { name: 'MamyPoko Gentle Cleansing Wipes (80s)', price: 160, mrp: 195, unit: '80 wipes', tags: ['baby_care'] },
        ],
      },
      {
        name: 'Baby Food',
        slug: 'baby-food',
        products: [
          { name: 'Nestlé Cerelac Wheat Apple Cereal 300g', price: 245, mrp: 260, unit: '300 g', tags: ['baby_care', 'monthly_grocery'] },
          { name: 'Nestlé Lactogen 1 Infant Formula 400g', price: 425, mrp: 450, unit: '400 g', tags: ['baby_care', 'monthly_grocery'] },
          { name: 'Slurrp Farm Organic Ragi Butter Cereal', price: 299, mrp: 349, unit: '200 g', tags: ['baby_care', 'fitness_nutrition'] },
          { name: 'Nestlé Nan Pro 1 Infant Formula Powder', price: 780, mrp: 820, unit: '400 g', tags: ['baby_care'] },
          { name: 'Timios Whole Grain Porridge for Babies', price: 210, mrp: 240, unit: '200 g', tags: ['baby_care'] },
          { name: 'Slurrp Farm Organic Banana Ragi Cereal', price: 299, mrp: 349, unit: '200 g', tags: ['baby_care'] },
          { name: 'Nestlé Cerelac Rice Cereal 300g', price: 235, mrp: 250, unit: '300 g', tags: ['baby_care'] },
          { name: 'Organic World Mango Apple Baby Puree', price: 140, mrp: 160, unit: '100 g pouch', tags: ['baby_care'] },
          { name: 'Gerber Organic Pear Peach Fruit Puree', price: 175, mrp: 199, unit: '90 g pouch', tags: ['baby_care'] },
          { name: 'Nestlé Lactogen 2 Follow-up Formula 400g', price: 430, mrp: 455, unit: '400 g', tags: ['baby_care'] },
          { name: 'Slurrp Farm Oats Honey Baby Powder', price: 285, mrp: 330, unit: '200 g', tags: ['baby_care'] },
          { name: 'Nestlé Cerelac Multigrain Dal Veg 300g', price: 255, mrp: 270, unit: '300 g', tags: ['baby_care'] },
          { name: 'Timios Melts Organic Baby Munchies 50g', price: 160, mrp: 185, unit: '50 g', tags: ['baby_care', 'office_snacks'] },
          { name: 'Nestlé Nan Pro 2 Follow-up Formula 400g', price: 790, mrp: 830, unit: '400 g', tags: ['baby_care'] },
          { name: 'Gerber Baby Organic Rice Cereal 227g', price: 340, mrp: 390, unit: '227 g', tags: ['baby_care'] },
          { name: 'Slurrp Farm Sprouted Ragi Powder 250g', price: 260, mrp: 299, unit: '250 g', tags: ['baby_care', 'fitness_nutrition'] },
          { name: 'Timios Organic Apple Puree Pouch 100g', price: 135, mrp: 155, unit: '100 g', tags: ['baby_care'] },
          { name: 'Nestlé Cerelac Wheat Orange Cereal 300g', price: 245, mrp: 260, unit: '300 g', tags: ['baby_care'] },
        ],
      },
      {
        name: 'Baby Skin Care',
        slug: 'baby-skin-care',
        products: [
          { name: 'Johnson’s Baby Powder 200g', price: 175, mrp: 195, unit: '200 g', tags: ['baby_care', 'monthly_grocery'] },
          { name: 'Himalaya Baby Lotion 200ml', price: 165, mrp: 190, unit: '200 ml', tags: ['baby_care'] },
          { name: 'Johnson’s Baby Hair & Body Oil 200ml', price: 210, mrp: 240, unit: '200 ml', tags: ['baby_care'] },
          { name: 'Baby Dove Rich Moisture Soap Bar 75g', price: 65, mrp: 75, unit: '75 g', tags: ['baby_care'] },
          { name: 'Sebamed Baby Gentle Wash 200ml', price: 460, mrp: 510, unit: '200 ml', tags: ['baby_care'] },
          { name: 'Himalaya Baby Nourishing Massage Oil 200ml', price: 185, mrp: 215, unit: '200 ml', tags: ['baby_care'] },
          { name: 'Johnson’s Baby No More Tears Shampoo', price: 195, mrp: 225, unit: '200 ml', tags: ['baby_care'] },
          { name: 'Biotique Bio Berry Sensitive Baby Cream', price: 140, mrp: 165, unit: '100 g', tags: ['baby_care'] },
          { name: 'Mamaearth Gentle Cleansing Baby Shampoo', price: 299, mrp: 349, unit: '200 ml', tags: ['baby_care'] },
          { name: 'Cetaphil Baby Daily Lotion 400ml', price: 680, mrp: 750, unit: '400 ml', tags: ['baby_care'] },
          { name: 'Aveeno Baby Daily Moisture Lotion 227ml', price: 799, mrp: 899, unit: '227 ml', tags: ['baby_care'] },
          { name: 'Himalaya Soft Baby Face Cream 100g', price: 130, mrp: 150, unit: '100 g', tags: ['baby_care'] },
          { name: 'Johnson’s Avocado Baby Hair Oil 100ml', price: 135, mrp: 155, unit: '100 ml', tags: ['baby_care'] },
          { name: 'Baby Dove Rich Moisture Body Lotion 200ml', price: 230, mrp: 270, unit: '200 ml', tags: ['baby_care'] },
          { name: 'Sebamed Baby Protective Facial Cream 50ml', price: 750, mrp: 850, unit: '50 ml', tags: ['baby_care'] },
          { name: 'Himalaya Prickly Heat Baby Powder 100g', price: 95, mrp: 110, unit: '100 g', tags: ['baby_care'] },
          { name: 'Biotique Bio Green Apple Baby Shampoo', price: 150, mrp: 180, unit: '120 ml', tags: ['baby_care'] },
          { name: 'Mamaearth Deeply Nourishing Baby Wash', price: 299, mrp: 349, unit: '200 ml', tags: ['baby_care'] },
        ],
      },
    ],
  },
  {
    name: 'Pet Care',
    slug: 'pet-care',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
    subcategories: [
      {
        name: 'Pet Food',
        slug: 'pet-food',
        products: [
          { name: 'Pedigree Adult Dry Dog Food Chicken 1.2kg', price: 380, mrp: 420, unit: '1.2 kg', tags: ['pet_care', 'monthly_grocery'] },
          { name: 'Whiskas Adult Dry Cat Food Ocean Fish 480g', price: 220, mrp: 250, unit: '480 g', tags: ['pet_care', 'monthly_grocery'] },
          { name: 'Royal Canin Mini Adult Dry Dog Food 800g', price: 620, mrp: 690, unit: '800 g', tags: ['pet_care'] },
          { name: 'Drools Focus Adult Superpremium Dog Food 1.2kg', price: 499, mrp: 575, unit: '1.2 kg', tags: ['pet_care'] },
          { name: 'Purepet Chicken & Vegetables Dog Food 3kg', price: 450, mrp: 520, unit: '3 kg', tags: ['pet_care', 'monthly_grocery'] },
          { name: 'Sheba Fine Wet Cat Food Chicken Terrine 70g', price: 60, mrp: 70, unit: '70 g pouch', tags: ['pet_care', 'late_night_cravings'] },
          { name: 'Pedigree Puppy Wet Dog Food Chicken Gravy (4s)', price: 180, mrp: 200, unit: '70g x 4', tags: ['pet_care'] },
          { name: 'Whiskas Kitten Wet Cat Food Tuna Gravy (4s)', price: 190, mrp: 215, unit: '85g x 4', tags: ['pet_care'] },
          { name: 'Drools Absolute Calcium Milk Dog Bone Treats', price: 199, mrp: 240, unit: '300 g', tags: ['pet_care'] },
          { name: 'Meat Up Puppy Dry Dog Food 1.2kg', price: 320, mrp: 375, unit: '1.2 kg', tags: ['pet_care'] },
          { name: 'Royal Canin Second Age Kitten Food 400g', price: 499, mrp: 560, unit: '400 g', tags: ['pet_care'] },
          { name: 'Purepet Ocean Fish Adult Cat Food 1.2kg', price: 325, mrp: 380, unit: '1.2 kg', tags: ['pet_care'] },
          { name: 'Pedigree Biscrok Dog Biscuit Treats 500g', price: 160, mrp: 180, unit: '500 g', tags: ['pet_care'] },
          { name: 'Whiskas Adult Wet Cat Food Mackerel Gravy', price: 50, mrp: 55, unit: '85 g pouch', tags: ['pet_care'] },
          { name: 'Drools Real Chicken Sausage Dog Treats', price: 140, mrp: 165, unit: '150 g', tags: ['pet_care'] },
          { name: 'Sheba Deluxe Tuna Gravy Wet Cat Food', price: 65, mrp: 75, unit: '70 g pouch', tags: ['pet_care'] },
          { name: 'Royal Canin Medium Adult Dry Dog Food 1kg', price: 780, mrp: 875, unit: '1 kg', tags: ['pet_care'] },
          { name: 'Purepet Crunchy Biscuit Dog Treats 500g', price: 135, mrp: 155, unit: '500 g', tags: ['pet_care'] },
        ],
      },
      {
        name: 'Pet Hygiene',
        slug: 'pet-hygiene',
        products: [
          { name: 'Drools Anti-Tick & Flea Dog Shampoo 200ml', price: 195, mrp: 230, unit: '200 ml', tags: ['pet_care', 'house_cleaning'] },
          { name: 'Himalayan Pet Wellness Herbal Odor Powder', price: 140, mrp: 165, unit: '100 g', tags: ['pet_care'] },
          { name: 'Pethedia Clumping Bentonite Cat Litter 5kg', price: 399, mrp: 480, unit: '5 kg', tags: ['pet_care', 'monthly_grocery'] },
          { name: 'Captain Zack Barking Tea Tree Dog Shampoo', price: 290, mrp: 340, unit: '200 ml', tags: ['pet_care'] },
          { name: 'Fresh For Paws Antiseptic Dog Wipes (30s)', price: 180, mrp: 215, unit: '30 wipes', tags: ['pet_care'] },
          { name: 'Emily Pets Stain & Odor Eliminator Spray 500ml', price: 320, mrp: 380, unit: '500 ml', tags: ['pet_care', 'house_cleaning'] },
          { name: 'Drools Waterless Dry Bath Pet Spray 200ml', price: 245, mrp: 290, unit: '200 ml', tags: ['pet_care'] },
          { name: 'Kennel Wash Disinfectant Floor Cleaner 1L', price: 210, mrp: 250, unit: '1 L', tags: ['pet_care', 'house_cleaning'] },
          { name: 'Captain Zack Tickless Tick Repellent Spray', price: 349, mrp: 400, unit: '150 ml', tags: ['pet_care'] },
          { name: 'Meow Clump Lavender Scented Cat Litter 5kg', price: 420, mrp: 500, unit: '5 kg', tags: ['pet_care'] },
          { name: 'Petkin Deodorizing Paw Wipes for Dogs (20s)', price: 199, mrp: 240, unit: '20 wipes', tags: ['pet_care'] },
          { name: 'Drools Herbal Neem Dog Shampoo 200ml', price: 175, mrp: 205, unit: '200 ml', tags: ['pet_care'] },
          { name: 'Fresh For Paws Coat Conditioning Spray', price: 280, mrp: 330, unit: '200 ml', tags: ['pet_care'] },
          { name: 'Captain Zack Washed Shine Conditioner', price: 275, mrp: 320, unit: '200 ml', tags: ['pet_care'] },
          { name: 'Emily Pets Potty Training Pads for Dogs (10s)', price: 299, mrp: 350, unit: '10 pads', tags: ['pet_care'] },
          { name: 'Drools Ear Cleaning Solution for Pets 100ml', price: 165, mrp: 195, unit: '100 ml', tags: ['pet_care'] },
          { name: 'Pethedia Lemon Scented Cat Litter Sand 5kg', price: 399, mrp: 480, unit: '5 kg', tags: ['pet_care'] },
          { name: 'Kennel Antibacterial Dog Bathing Soap 75g', price: 65, mrp: 75, unit: '75 g', tags: ['pet_care'] },
        ],
      },
      {
        name: 'Pet Accessories',
        slug: 'pet-accessories',
        products: [
          { name: 'Heads Up For Tails Nylon Dog Collar & Leash Set', price: 349, mrp: 399, unit: '1 set', tags: ['pet_care'] },
          { name: 'Royal Pet Durable Rubber Chew Ball Toy', price: 125, mrp: 150, unit: '1 pc', tags: ['pet_care'] },
          { name: 'Emily Pets Stainless Steel Non-Spill Dog Bowl', price: 195, mrp: 240, unit: '500 ml', tags: ['pet_care'] },
          { name: 'Heads Up For Tails Sisal Scratching Post Toy', price: 699, mrp: 850, unit: '1 pc', tags: ['pet_care'] },
          { name: 'Drools Adjustable Nylon Dog Harness Medium', price: 299, mrp: 360, unit: '1 pc', tags: ['pet_care'] },
          { name: 'Choostix Pressed Hide Dog Chew Bones (4s)', price: 145, mrp: 175, unit: '4 pcs', tags: ['pet_care'] },
          { name: 'Emily Pets Interactive Feather Teaser Cat Wand', price: 160, mrp: 195, unit: '1 pc', tags: ['pet_care'] },
          { name: 'Heads Up For Tails Self-Cleaning Slicker Brush', price: 320, mrp: 380, unit: '1 pc', tags: ['pet_care'] },
          { name: 'Royal Pet Soft Washable Dog Bed Cushion', price: 899, mrp: 1099, unit: 'Medium', tags: ['pet_care'] },
          { name: 'Drools Heavy-Duty Stainless Steel Nail Clipper', price: 210, mrp: 250, unit: '1 pc', tags: ['pet_care'] },
          { name: 'Choostix Rawhide Dog Chew Bones Pack', price: 180, mrp: 215, unit: '250 g', tags: ['pet_care'] },
          { name: 'Emily Pets Quick Release Cat Collar with Bell', price: 99, mrp: 125, unit: '1 pc', tags: ['pet_care'] },
          { name: 'Heads Up For Tails Treat Dispenser Ball', price: 280, mrp: 340, unit: '1 pc', tags: ['pet_care'] },
          { name: 'Royal Pet Double-Sided Dog Grooming Comb', price: 175, mrp: 210, unit: '1 pc', tags: ['pet_care'] },
          { name: 'Drools Escape-Proof Cat Harness & Leash', price: 250, mrp: 300, unit: '1 set', tags: ['pet_care'] },
          { name: 'Choostix Calcium Milk Bones Dog Treats (10s)', price: 190, mrp: 225, unit: '10 bones', tags: ['pet_care'] },
          { name: 'Emily Pets Waterproof Dog Raincoat Medium', price: 449, mrp: 550, unit: '1 pc', tags: ['pet_care'] },
          { name: 'Heads Up For Tails Foldable Pet Travel Carrier', price: 1199, mrp: 1499, unit: '1 pc', tags: ['pet_care'] },
        ],
      },
    ],
  },
];

const COUPONS = [
  { code: 'WELCOME100', discountType: 'FLAT', value: 100, minCartValue: 399 },
  { code: 'MISSION20', discountType: 'PERCENTAGE', value: 20, minCartValue: 299 },
  { code: 'BLINK50', discountType: 'FLAT', value: 50, minCartValue: 199 },
  { code: 'FREESHIP', discountType: 'FLAT', value: 30, minCartValue: 149 },
];

async function main() {
  console.log('🌱 Starting BlinkClone Database Seed Engine (Phase 1)...');

  // Clean existing tables in correct order
  console.log('🧹 Cleaning existing database records...');
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.missionSignalEvent.deleteMany();

  // 1. Seed 13 reference missions (8 clustered + 5 extended)
  console.log('📌 Seeding 13 reference mission definitions...');
  for (const m of MISSIONS) {
    const dataObj: any = {
      key: m.key,
      displayName: m.displayName,
      icon: m.icon,
      checklistCategories: isSqlite ? (JSON.stringify(m.checklistCategories) as any) : m.checklistCategories,
    };
    await prisma.mission.create({ data: dataObj });
  }
  console.log(`✅ Seeded ${MISSIONS.length} missions.`);

  // 2. Seed 10 Top-Level Categories, 30 Subcategories, and ~540 Products
  console.log('📦 Seeding 10 top-level categories, 30 subcategories, and products...');
  let totalCategories = 0;
  let totalSubcategories = 0;
  let totalProducts = 0;

  for (const catData of TAXONOMY_CATALOG) {
    const parentCat = await prisma.category.create({
      data: {
        name: catData.name,
        slug: catData.slug,
        imageUrl: catData.imageUrl,
      },
    });
    totalCategories++;

    for (const subData of catData.subcategories) {
      const subCat = await prisma.category.create({
        data: {
          name: subData.name,
          slug: subData.slug,
          parentId: parentCat.id,
        },
      });
      totalSubcategories++;

      for (let i = 0; i < subData.products.length; i++) {
        const prod = subData.products[i];
        const rawSlug = prod.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const slug = `${rawSlug}-${totalProducts + 1}`;

        const productDataObj: any = {
          name: prod.name,
          slug,
          categoryId: subCat.id,
          subcategory: subData.name,
          price: prod.price,
          mrp: prod.mrp,
          unit: prod.unit,
          imageUrl: catData.imageUrl,
          description: `Fresh, high quality ${prod.name} delivered in 10 minutes. guaranteed fresh and hygienic packaging.`,
          missionTags: isSqlite ? (JSON.stringify(prod.tags) as any) : prod.tags,
          stockQty: 100,
        };

        await prisma.product.create({ data: productDataObj });
        totalProducts++;
      }
    }
  }
  console.log(`✅ Seeded ${totalCategories} categories, ${totalSubcategories} subcategories, and ${totalProducts} products.`);

  // 3. Seed Coupons
  console.log('🎟️ Seeding promotional & demo coupons...');
  await prisma.coupon.createMany({ data: COUPONS });
  console.log(`✅ Seeded ${COUPONS.length} coupons.`);

  // 4. Seed Demo Test User & Address
  console.log('👤 Seeding demo test user and default delivery address...');
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password@123', salt);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo Customer',
      email: 'demo@blinkclone.com',
      passwordHash,
    },
  });

  await prisma.address.create({
    data: {
      userId: demoUser.id,
      line1: '123 Indiranagar, 100ft Road',
      city: 'Bengaluru',
      pincode: '560038',
      isDefault: true,
    },
  });
  console.log(`✅ Seeded demo user (${demoUser.email}) and delivery address.`);

  console.log('\n🎉 Phase 1 Database Seed Engine execution completed successfully!');
  console.log(`Summary: ${totalCategories} Top Categories | ${totalSubcategories} Subcategories | ${totalProducts} Products | ${MISSIONS.length} Missions | ${COUPONS.length} Coupons | 1 Demo User`);
}

main()
  .catch((e) => {
    console.error('❌ Seed script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
