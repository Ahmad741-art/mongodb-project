import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  articleNumber: { 
    type: Number, 
    required: [true, 'Article number is required'],
    unique: true,
    min: [1, 'Article number must be positive'],
    index: true // Add index for better query performance
  },
  articleName: { 
    type: String, 
    required: [true, 'Article name is required'],
    trim: true,
    maxlength: [200, 'Article name cannot exceed 200 characters'],
    index: 'text' // Enable text search
  },
  unit: {
    type: String,
    trim: true,
    maxlength: [50, 'Unit cannot exceed 50 characters'],
    default: 'pcs',
    enum: {
      values: ['pcs', 'kg', 'g', 'lb', 'oz', 'm', 'cm', 'mm', 'ft', 'in', 'l', 'ml', 'gal', 'qt', 'pt', 'set', 'box', 'pack', 'dozen', 'pair', 'other'],
      message: '{VALUE} is not a valid unit'
    }
  },
  packageSize: {
    type: Number,
    min: [0, 'Package size cannot be negative'],
    default: 1,
    validate: {
      validator: function(v) {
        return v === null || v === undefined || v >= 0;
      },
      message: 'Package size must be a positive number'
    }
  },
  purchasePrice: {
    type: Number,
    min: [0, 'Purchase price cannot be negative'],
    default: 0,
    set: function(v) {
      return Math.round(v * 100) / 100; // Round to 2 decimal places
    }
  },
  salesPrice: {
    type: Number,
    min: [0, 'Sales price cannot be negative'],
    default: 0,
    set: function(v) {
      return Math.round(v * 100) / 100; // Round to 2 decimal places
    }
  },
  // Additional professional fields
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters'],
    default: 'General'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  barcode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allow null values but enforce uniqueness when present
    validate: {
      validator: function(v) {
        // Basic barcode validation (UPC, EAN, etc.)
        return !v || /^[0-9]{8,14}$/.test(v);
      },
      message: 'Barcode must be 8-14 digits'
    }
  },
  stockQuantity: {
    type: Number,
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  minStockLevel: {
    type: Number,
    min: [0, 'Minimum stock level cannot be negative'],
    default: 0
  },
  supplier: {
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Supplier name cannot exceed 200 characters']
    },
    contactInfo: {
      type: String,
      trim: true,
      maxlength: [200, 'Supplier contact info cannot exceed 200 characters']
    }
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    weight: { type: Number, min: 0 }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'discontinued', 'out_of_stock', 'pending'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  // Audit fields
  createdBy: {
    type: String,
    trim: true,
    maxlength: [100, 'Created by field cannot exceed 100 characters']
  },
  updatedBy: {
    type: String,
    trim: true,
    maxlength: [100, 'Updated by field cannot exceed 100 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Schema options
  timestamps: true, // Automatically manage createdAt and updatedAt
  versionKey: false, // Disable __v field
  toJSON: { virtuals: true }, // Include virtuals when converting to JSON
  toObject: { virtuals: true }
});

// Virtual fields (computed properties)
articleSchema.virtual('profitMargin').get(function() {
  if (!this.purchasePrice || !this.salesPrice) return 0;
  return Math.round(((this.salesPrice - this.purchasePrice) / this.salesPrice) * 100);
});

articleSchema.virtual('profitAmount').get(function() {
  if (!this.purchasePrice || !this.salesPrice) return 0;
  return Math.round((this.salesPrice - this.purchasePrice) * 100) / 100;
});

articleSchema.virtual('totalValue').get(function() {
  return Math.round((this.salesPrice * this.stockQuantity) * 100) / 100;
});

articleSchema.virtual('isLowStock').get(function() {
  return this.stockQuantity <= this.minStockLevel;
});

articleSchema.virtual('displayName').get(function() {
  return `#${this.articleNumber} - ${this.articleName}`;
});

// Indexes for better query performance
articleSchema.index({ articleName: 'text', description: 'text' }); // Text search
articleSchema.index({ category: 1, status: 1 }); // Category and status queries
articleSchema.index({ salesPrice: 1 }); // Price range queries
articleSchema.index({ stockQuantity: 1 }); // Stock level queries
articleSchema.index({ createdAt: -1 }); // Recent articles
articleSchema.index({ 'supplier.name': 1 }); // Supplier queries

// Pre-save middleware
articleSchema.pre('save', function(next) {
  // Update the updatedAt field
  this.updatedAt = new Date();
  
  // Validate profit margin (optional business rule)
  if (this.purchasePrice && this.salesPrice && this.salesPrice < this.purchasePrice) {
    console.warn(`Warning: Article ${this.articleNumber} has negative profit margin`);
  }
  
  // Auto-generate barcode if not provided (simple sequential)
  if (!this.barcode && this.isNew) {
    // This is a simple example - in production, use a proper barcode generation system
    this.barcode = `${Date.now()}${Math.floor(Math.random() * 1000)}`.substr(-12);
  }
  
  next();
});

// Pre-update middleware
articleSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Static methods (callable on the model)
articleSchema.statics.findByCategory = function(category) {
  return this.find({ category: category, status: 'active' });
};

articleSchema.statics.findLowStock = function() {
  return this.find({
    $expr: { $lte: ['$stockQuantity', '$minStockLevel'] },
    status: 'active'
  });
};

articleSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({
    salesPrice: { $gte: minPrice, $lte: maxPrice },
    status: 'active'
  });
};

articleSchema.statics.getTopSellingArticles = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ salesPrice: -1, stockQuantity: -1 })
    .limit(limit);
};

// Instance methods (callable on document instances)
articleSchema.methods.updateStock = function(quantity, operation = 'set') {
  if (operation === 'add') {
    this.stockQuantity += quantity;
  } else if (operation === 'subtract') {
    this.stockQuantity = Math.max(0, this.stockQuantity - quantity);
  } else {
    this.stockQuantity = Math.max(0, quantity);
  }
  return this.save();
};

articleSchema.methods.markAsDiscontinued = function() {
  this.status = 'discontinued';
  return this.save();
};

articleSchema.methods.calculateReorderPoint = function(leadTimeDays = 7, dailyUsage = 1) {
  return Math.ceil(leadTimeDays * dailyUsage) + this.minStockLevel;
};

// Error handling middleware
articleSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    next(new Error(message));
  } else {
    next(error);
  }
});

// Create and export the model
const Article = mongoose.model("Article", articleSchema);

export default Article;