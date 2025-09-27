// generateArticles.js - Generate 50,000 realistic articles for testing
import mongoose from "mongoose";
import Article from "./models/Article.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./config.env" });

// Realistic product categories and their typical items
const productCategories = {
  'Electronics': [
    'Smartphone', 'Laptop', 'Tablet', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 
    'Speaker', 'Webcam', 'Router', 'Switch', 'Cable', 'Adapter', 'Charger', 'Battery',
    'Memory Card', 'USB Drive', 'Hard Drive', 'SSD', 'Processor', 'Graphics Card',
    'Motherboard', 'RAM', 'Power Supply', 'Case', 'Cooling Fan', 'LED Strip'
  ],
  'Office Supplies': [
    'Pen', 'Pencil', 'Notebook', 'Binder', 'Paper', 'Stapler', 'Scissors', 'Tape',
    'Glue', 'Marker', 'Highlighter', 'Eraser', 'Ruler', 'Calculator', 'Folder',
    'Envelope', 'Stamp', 'Paper Clip', 'Rubber Band', 'Sticky Notes', 'Label',
    'Shredder', 'Laminator', 'Printer Cartridge', 'Toner', 'Filing Cabinet'
  ],
  'Home & Garden': [
    'Sofa', 'Chair', 'Table', 'Bed', 'Dresser', 'Lamp', 'Curtain', 'Rug', 'Pillow',
    'Blanket', 'Vase', 'Picture Frame', 'Mirror', 'Clock', 'Plant Pot', 'Garden Tool',
    'Hose', 'Sprinkler', 'Fertilizer', 'Seeds', 'Soil', 'Mulch', 'Gloves', 'Watering Can'
  ],
  'Sports & Recreation': [
    'Basketball', 'Football', 'Soccer Ball', 'Tennis Racket', 'Golf Club', 'Baseball Bat',
    'Helmet', 'Glove', 'Sneakers', 'Jersey', 'Shorts', 'Water Bottle', 'Gym Bag',
    'Yoga Mat', 'Dumbbell', 'Resistance Band', 'Jump Rope', 'Exercise Ball', 'Treadmill'
  ],
  'Automotive': [
    'Tire', 'Battery', 'Oil Filter', 'Air Filter', 'Spark Plug', 'Brake Pad', 'Wiper Blade',
    'Headlight', 'Taillight', 'Mirror', 'Seat Cover', 'Floor Mat', 'Car Charger',
    'Phone Mount', 'Dashboard Camera', 'GPS', 'Tool Kit', 'Jump Starter', 'Air Freshener'
  ],
  'Health & Beauty': [
    'Shampoo', 'Conditioner', 'Soap', 'Toothbrush', 'Toothpaste', 'Moisturizer',
    'Sunscreen', 'Perfume', 'Makeup', 'Nail Polish', 'Hair Brush', 'Comb', 'Mirror',
    'Towel', 'Bathrobe', 'Vitamins', 'Supplements', 'First Aid Kit', 'Thermometer'
  ],
  'Food & Beverage': [
    'Coffee', 'Tea', 'Sugar', 'Salt', 'Pepper', 'Spice', 'Oil', 'Vinegar', 'Sauce',
    'Pasta', 'Rice', 'Flour', 'Cereal', 'Snack', 'Juice', 'Water', 'Soda', 'Energy Drink'
  ],
  'Books & Media': [
    'Novel', 'Textbook', 'Magazine', 'Comic Book', 'DVD', 'Blu-ray', 'CD', 'Vinyl Record',
    'Video Game', 'Board Game', 'Puzzle', 'Art Supply', 'Craft Kit', 'Musical Instrument'
  ],
  'Clothing & Accessories': [
    'T-Shirt', 'Jeans', 'Dress', 'Jacket', 'Sweater', 'Shoes', 'Boots', 'Sandals',
    'Hat', 'Cap', 'Scarf', 'Belt', 'Watch', 'Jewelry', 'Bag', 'Backpack', 'Wallet',
    'Sunglasses', 'Tie', 'Socks', 'Underwear', 'Pajamas', 'Swimwear', 'Gloves'
  ],
  'Tools & Hardware': [
    'Hammer', 'Screwdriver', 'Wrench', 'Pliers', 'Drill', 'Saw', 'Level', 'Measuring Tape',
    'Screws', 'Nails', 'Bolts', 'Nuts', 'Washer', 'Anchor', 'Wire', 'Pipe', 'Valve',
    'Switch', 'Socket', 'Light Bulb', 'Fuse', 'Battery', 'Paint', 'Brush', 'Roller'
  ]
};

// Units for different product types
const units = ['pcs', 'kg', 'g', 'lb', 'oz', 'm', 'cm', 'ft', 'in', 'l', 'ml', 'gal', 'set', 'box', 'pack', 'dozen', 'pair'];

// Brands to make products more realistic
const brands = [
  'TechPro', 'EliteMax', 'ProForce', 'UltraCore', 'MaxPower', 'SpeedTech', 'InnoVate',
  'PrimeTech', 'NextGen', 'PowerMax', 'TurboForce', 'MegaTech', 'SuperCore', 'HyperMax',
  'AlphaTech', 'BetaForce', 'GammaCore', 'DeltaMax', 'OmegaTech', 'ZenithPro', 'ApexMax',
  'VortexTech', 'NovaPro', 'StellarMax', 'CosmicTech', 'QuantumPro', 'FusionMax', 'NeonTech'
];

// Adjectives to create variety
const adjectives = [
  'Premium', 'Professional', 'Advanced', 'Standard', 'Basic', 'Deluxe', 'Economy',
  'Heavy Duty', 'Industrial', 'Commercial', 'Residential', 'Portable', 'Wireless',
  'Bluetooth', 'Smart', 'Digital', 'Analog', 'Automatic', 'Manual', 'Compact',
  'Large', 'Medium', 'Small', 'Extra Large', 'Mini', 'Micro', 'Ultra', 'Super',
  'High Performance', 'Energy Efficient', 'Eco Friendly', 'Waterproof', 'Durable'
];

// Generate random number within range
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random decimal within range
function randomDecimal(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Pick random element from array
function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate realistic article name
function generateArticleName(category, baseItem) {
  const brand = randomPick(brands);
  const adjective = Math.random() > 0.5 ? randomPick(adjectives) : '';
  const model = Math.random() > 0.7 ? randomBetween(100, 9999) : '';
  
  const parts = [brand, adjective, baseItem, model].filter(Boolean);
  return parts.join(' ').trim();
}

// Generate realistic pricing based on category
function generatePricing(category, baseItem) {
  let priceRanges = {
    'Electronics': { min: 15, max: 2500 },
    'Office Supplies': { min: 1, max: 150 },
    'Home & Garden': { min: 10, max: 1200 },
    'Sports & Recreation': { min: 8, max: 800 },
    'Automotive': { min: 15, max: 500 },
    'Health & Beauty': { min: 3, max: 120 },
    'Food & Beverage': { min: 1, max: 50 },
    'Books & Media': { min: 5, max: 200 },
    'Clothing & Accessories': { min: 10, max: 300 },
    'Tools & Hardware': { min: 5, max: 400 }
  };

  const range = priceRanges[category] || { min: 5, max: 100 };
  
  // Purchase price (wholesale)
  const purchasePrice = randomDecimal(range.min, range.max * 0.6);
  
  // Sales price (retail) - typically 40-120% markup
  const markupMultiplier = randomDecimal(1.4, 2.2);
  const salesPrice = purchasePrice * markupMultiplier;
  
  return {
    purchasePrice: Math.round(purchasePrice * 100) / 100,
    salesPrice: Math.round(salesPrice * 100) / 100
  };
}

// Generate realistic package size based on item type
function generatePackageSize(baseItem, unit) {
  const sizeRanges = {
    'liquid': { 'ml': [50, 1000], 'l': [0.1, 5], 'gal': [0.1, 2] },
    'weight': { 'g': [10, 5000], 'kg': [0.1, 50], 'lb': [0.1, 100], 'oz': [1, 64] },
    'length': { 'cm': [1, 200], 'm': [0.1, 10], 'in': [1, 80], 'ft': [0.1, 30] },
    'count': { 'pcs': [1, 100], 'set': [1, 20], 'box': [1, 50], 'pack': [1, 25], 'dozen': [1, 10], 'pair': [1, 5] }
  };

  let category = 'count'; // default
  if (['ml', 'l', 'gal'].includes(unit)) category = 'liquid';
  if (['g', 'kg', 'lb', 'oz'].includes(unit)) category = 'weight';
  if (['cm', 'm', 'in', 'ft'].includes(unit)) category = 'length';

  const range = sizeRanges[category][unit] || [1, 10];
  return randomBetween(range[0], range[1]);
}

// Generate appropriate unit for item
function generateUnit(category, baseItem) {
  const categoryUnits = {
    'Electronics': ['pcs', 'set'],
    'Office Supplies': ['pcs', 'pack', 'box', 'dozen'],
    'Home & Garden': ['pcs', 'set', 'pack'],
    'Sports & Recreation': ['pcs', 'set', 'pair'],
    'Automotive': ['pcs', 'set', 'pair'],
    'Health & Beauty': ['pcs', 'ml', 'g', 'oz'],
    'Food & Beverage': ['g', 'kg', 'ml', 'l', 'oz', 'lb'],
    'Books & Media': ['pcs'],
    'Clothing & Accessories': ['pcs', 'pair'],
    'Tools & Hardware': ['pcs', 'set', 'pack', 'box']
  };

  const availableUnits = categoryUnits[category] || ['pcs'];
  return randomPick(availableUnits);
}

// Generate a single article
function generateSingleArticle(articleNumber) {
  const category = randomPick(Object.keys(productCategories));
  const baseItem = randomPick(productCategories[category]);
  const unit = generateUnit(category, baseItem);
  const pricing = generatePricing(category, baseItem);
  
  return {
    articleNumber: articleNumber,
    articleName: generateArticleName(category, baseItem),
    unit: unit,
    packageSize: generatePackageSize(baseItem, unit),
    purchasePrice: pricing.purchasePrice,
    salesPrice: pricing.salesPrice,
    // Optional enhanced fields
    category: category,
    description: `High-quality ${baseItem.toLowerCase()} for ${category.toLowerCase().replace('&', 'and')} applications.`,
    createdAt: new Date(Date.now() - randomBetween(0, 365 * 24 * 60 * 60 * 1000)), // Random date within last year
    updatedAt: new Date()
  };
}

// Generate articles in batches for better performance
async function generateArticlesBatch(startNum, batchSize, totalGenerated) {
  const articles = [];
  
  for (let i = 0; i < batchSize; i++) {
    articles.push(generateSingleArticle(startNum + i));
  }

  try {
    await Article.insertMany(articles, { ordered: false });
    console.log(`✅ Generated batch: ${totalGenerated + batchSize}/${50000} articles (${((totalGenerated + batchSize)/50000*100).toFixed(1)}%)`);
    return batchSize;
  } catch (error) {
    // Handle duplicate key errors gracefully
    let successCount = 0;
    for (const article of articles) {
      try {
        await Article.create(article);
        successCount++;
      } catch (err) {
        if (err.code !== 11000) { // Not a duplicate key error
          console.error(`Error creating article ${article.articleNumber}:`, err.message);
        }
      }
    }
    console.log(`⚠️  Generated batch with ${successCount}/${batchSize} successful inserts`);
    return successCount;
  }
}

// Main generation function
async function generateArticles() {
  console.log('🚀 Starting article generation...');
  console.log('📊 Target: 50,000 articles');
  console.log('⚡ Using optimized batch processing\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check existing articles
    const existingCount = await Article.countDocuments();
    console.log(`📈 Existing articles in database: ${existingCount.toLocaleString()}`);

    if (existingCount >= 50000) {
      console.log('🎉 Database already has 50,000+ articles!');
      process.exit(0);
    }

    // Clear existing articles (optional - comment out if you want to keep existing data)
    // await Article.deleteMany({});
    // console.log('🧹 Cleared existing articles\n');

    const batchSize = 1000; // Process 1000 articles at a time
    const targetTotal = 50000;
    let totalGenerated = existingCount;
    let currentArticleNumber = existingCount + 1;

    console.log('⚡ Starting batch generation...\n');

    const startTime = Date.now();

    while (totalGenerated < targetTotal) {
      const remainingArticles = targetTotal - totalGenerated;
      const currentBatchSize = Math.min(batchSize, remainingArticles);
      
      const generated = await generateArticlesBatch(currentArticleNumber, currentBatchSize, totalGenerated);
      totalGenerated += generated;
      currentArticleNumber += generated;

      // Progress update with ETA
      const elapsed = Date.now() - startTime;
      const rate = totalGenerated / (elapsed / 1000); // articles per second
      const eta = remainingArticles / rate;
      
      console.log(`📈 Progress: ${totalGenerated.toLocaleString()}/${targetTotal.toLocaleString()} | Rate: ${Math.round(rate)} articles/sec | ETA: ${Math.round(eta/60)} min\n`);

      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    console.log('🎉 GENERATION COMPLETE!');
    console.log(`📊 Total articles generated: ${totalGenerated.toLocaleString()}`);
    console.log(`⏱️  Total time: ${Math.round(totalTime)} seconds`);
    console.log(`⚡ Average rate: ${Math.round(totalGenerated / totalTime)} articles/second`);
    
    // Display sample statistics
    const stats = await Article.aggregate([
      {
        $group: {
          _id: null,
          totalArticles: { $sum: 1 },
          avgSalesPrice: { $avg: '$salesPrice' },
          maxPrice: { $max: '$salesPrice' },
          minPrice: { $min: '$salesPrice' },
          totalValue: { $sum: { $multiply: ['$salesPrice', '$packageSize'] } }
        }
      }
    ]);

    if (stats[0]) {
      console.log('\n📈 DATABASE STATISTICS:');
      console.log(`Total Articles: ${stats[0].totalArticles.toLocaleString()}`);
      console.log(`Average Price: $${stats[0].avgSalesPrice.toFixed(2)}`);
      console.log(`Price Range: $${stats[0].minPrice.toFixed(2)} - $${stats[0].maxPrice.toFixed(2)}`);
      console.log(`Total Inventory Value: $${stats[0].totalValue.toLocaleString()}`);
    }

    console.log('\n🚀 Your application is now ready to handle enterprise-scale data!');
    console.log('💼 Perfect for impressing your manager with professional-grade performance.');

  } catch (error) {
    console.error('❌ Error during generation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📝 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Enhanced progress tracking
function displayProgressBar(current, total) {
  const percentage = (current / total) * 100;
  const filledBars = Math.round(percentage / 2);
  const emptyBars = 50 - filledBars;
  
  const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
  process.stdout.write(`\r[${progressBar}] ${percentage.toFixed(1)}% (${current.toLocaleString()}/${total.toLocaleString()})`);
}

// Run the generator
generateArticles().catch(console.error);