// quickGenerate.js - Generate 1000 articles quickly for immediate testing
import mongoose from "mongoose";
import Article from "./models/Article.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const quickArticleData = [
  // Electronics
  { base: 'Smartphone', category: 'Electronics', priceRange: [200, 1200] },
  { base: 'Laptop', category: 'Electronics', priceRange: [500, 2000] },
  { base: 'Tablet', category: 'Electronics', priceRange: [150, 800] },
  { base: 'Monitor', category: 'Electronics', priceRange: [100, 600] },
  { base: 'Keyboard', category: 'Electronics', priceRange: [20, 200] },
  { base: 'Mouse', category: 'Electronics', priceRange: [15, 150] },
  { base: 'Headphones', category: 'Electronics', priceRange: [25, 400] },
  { base: 'Speaker', category: 'Electronics', priceRange: [30, 500] },
  
  // Office Supplies
  { base: 'Pen', category: 'Office Supplies', priceRange: [1, 15] },
  { base: 'Notebook', category: 'Office Supplies', priceRange: [2, 25] },
  { base: 'Binder', category: 'Office Supplies', priceRange: [3, 20] },
  { base: 'Paper', category: 'Office Supplies', priceRange: [5, 40] },
  { base: 'Stapler', category: 'Office Supplies', priceRange: [8, 50] },
  { base: 'Calculator', category: 'Office Supplies', priceRange: [10, 80] },
  
  // Home & Garden
  { base: 'Chair', category: 'Home & Garden', priceRange: [50, 400] },
  { base: 'Table', category: 'Home & Garden', priceRange: [80, 600] },
  { base: 'Lamp', category: 'Home & Garden', priceRange: [25, 200] },
  { base: 'Rug', category: 'Home & Garden', priceRange: [30, 300] },
  { base: 'Plant Pot', category: 'Home & Garden', priceRange: [10, 80] },
  { base: 'Garden Tool', category: 'Home & Garden', priceRange: [15, 120] }
];

const brands = ['TechPro', 'EliteMax', 'ProForce', 'UltraCore', 'MaxPower', 'SpeedTech'];
const adjectives = ['Premium', 'Professional', 'Advanced', 'Standard', 'Basic', 'Deluxe'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function generateQuickArticles() {
  console.log('🚀 Quick Generate: 1000 Articles');
  console.log('⚡ Perfect for immediate testing!\n');

  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing articles
    await Article.deleteMany({});
    console.log('🧹 Cleared existing data\n');

    const articles = [];
    
    for (let i = 1; i <= 1000; i++) {
      const template = randomPick(quickArticleData);
      const brand = randomPick(brands);
      const adjective = Math.random() > 0.5 ? randomPick(adjectives) : '';
      const model = randomBetween(100, 999);
      
      const purchasePrice = randomDecimal(template.priceRange[0] * 0.6, template.priceRange[1] * 0.6);
      const salesPrice = purchasePrice * randomDecimal(1.4, 2.2);
      
      articles.push({
        articleNumber: i,
        articleName: `${brand} ${adjective} ${template.base} ${model}`.replace(/\s+/g, ' ').trim(),
        unit: randomPick(['pcs', 'set', 'pack', 'box']),
        packageSize: randomBetween(1, 50),
        purchasePrice: Math.round(purchasePrice * 100) / 100,
        salesPrice: Math.round(salesPrice * 100) / 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (i % 100 === 0) {
        console.log(`📈 Generated ${i}/1000 articles...`);
      }
    }

    await Article.insertMany(articles);
    
    console.log('\n🎉 SUCCESS! Generated 1000 articles');
    console.log('📊 Your database is ready for testing!');
    console.log('🚀 Run your application and see the professional UI in action!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

generateQuickArticles();