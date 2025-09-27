import express from "express";
import Article from "../models/Article.js";

const router = express.Router();

// ===============================
// GET all articles with pagination, search, and sorting
// ===============================
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      sortBy = "articleNumber",
      sortOrder = "asc"
    } = req.query;

    // Convert to numbers
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(1000, Math.max(1, parseInt(limit))); // Cap at 1000 for performance
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery = {};
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const numericSearch = parseFloat(searchTerm);
      
      searchQuery = {
        $or: [
          { articleName: { $regex: searchTerm, $options: 'i' } },
          { unit: { $regex: searchTerm, $options: 'i' } },
          // Search by article number if it's a number
          ...(isNaN(numericSearch) ? [] : [
            { articleNumber: numericSearch },
            { packageSize: numericSearch },
            { purchasePrice: { $gte: numericSearch * 0.9, $lte: numericSearch * 1.1 } },
            { salesPrice: { $gte: numericSearch * 0.9, $lte: numericSearch * 1.1 } }
          ])
        ]
      };
    }

    // Build sort query
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    let sortQuery = {};
    
    // Validate sort field to prevent injection
    const allowedSortFields = ['articleNumber', 'articleName', 'unit', 'packageSize', 'purchasePrice', 'salesPrice', 'createdAt'];
    if (allowedSortFields.includes(sortBy)) {
      sortQuery[sortBy] = sortDirection;
    } else {
      sortQuery.articleNumber = 1; // Default sort
    }

    // Execute queries in parallel for better performance
    const [articles, totalCount] = await Promise.all([
      Article.find(searchQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance - returns plain JS objects
      Article.countDocuments(searchQuery)
    ]);

    // Calculate additional metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Performance metrics
    const responseTime = Date.now();

    // Send enhanced response
    res.json({
      articles,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
        startIndex: skip + 1,
        endIndex: Math.min(skip + limitNum, totalCount)
      },
      search: {
        term: search,
        resultsFound: totalCount
      },
      sort: {
        field: sortBy,
        order: sortOrder
      },
      meta: {
        responseTime: Date.now() - responseTime,
        timestamp: new Date().toISOString()
      },
      // For backward compatibility
      total: totalCount
    });

  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ 
      message: "Server error while fetching articles",
      error: err.message 
    });
  }
});

// ===============================
// GET article statistics
// ===============================
router.get("/stats", async (req, res) => {
  try {
    const stats = await Article.aggregate([
      {
        $group: {
          _id: null,
          totalArticles: { $sum: 1 },
          totalInventoryValue: { 
            $sum: { $multiply: ["$salesPrice", "$packageSize"] } 
          },
          averageSalesPrice: { $avg: "$salesPrice" },
          averagePurchasePrice: { $avg: "$purchasePrice" },
          highestSalesPrice: { $max: "$salesPrice" },
          lowestSalesPrice: { $min: "$salesPrice" },
          totalPackageSize: { $sum: "$packageSize" }
        }
      }
    ]);

    // Get price distribution
    const priceDistribution = await Article.aggregate([
      {
        $bucket: {
          groupBy: "$salesPrice",
          boundaries: [0, 10, 50, 100, 500, 1000, 5000, Infinity],
          default: "Other",
          output: {
            count: { $sum: 1 },
            articles: { $push: "$articleName" }
          }
        }
      }
    ]);

    // Get top units
    const topUnits = await Article.aggregate([
      {
        $group: {
          _id: "$unit",
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$salesPrice", "$packageSize"] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: stats[0] || {
        totalArticles: 0,
        totalInventoryValue: 0,
        averageSalesPrice: 0,
        averagePurchasePrice: 0,
        highestSalesPrice: 0,
        lowestSalesPrice: 0,
        totalPackageSize: 0
      },
      priceDistribution,
      topUnits,
      generatedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error("Error generating statistics:", err);
    res.status(500).json({ 
      message: "Error generating statistics",
      error: err.message 
    });
  }
});

// ===============================
// GET one article by ID
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(400).json({ message: "Invalid article ID" });
  }
});

// ===============================
// CREATE a new article with validation
// ===============================
router.post("/", async (req, res) => {
  try {
    const { articleNumber, articleName, unit, packageSize, purchasePrice, salesPrice } = req.body;

    // Enhanced validation
    if (!articleNumber || !articleName) {
      return res.status(400).json({ 
        message: "Article number and name are required" 
      });
    }

    // Check for duplicate article number
    const existingArticle = await Article.findOne({ articleNumber });
    if (existingArticle) {
      return res.status(400).json({ 
        message: `Article number ${articleNumber} already exists` 
      });
    }

    // Validate numeric fields
    if (packageSize && (isNaN(packageSize) || packageSize < 0)) {
      return res.status(400).json({ 
        message: "Package size must be a positive number" 
      });
    }

    if (purchasePrice && (isNaN(purchasePrice) || purchasePrice < 0)) {
      return res.status(400).json({ 
        message: "Purchase price must be a positive number" 
      });
    }

    if (salesPrice && (isNaN(salesPrice) || salesPrice < 0)) {
      return res.status(400).json({ 
        message: "Sales price must be a positive number" 
      });
    }

    const article = new Article({
      articleNumber: parseInt(articleNumber),
      articleName: articleName.trim(),
      unit: unit ? unit.trim() : '',
      packageSize: packageSize ? parseFloat(packageSize) : 0,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : 0,
      salesPrice: salesPrice ? parseFloat(salesPrice) : 0
    });

    await article.save();
    res.status(201).json({
      article,
      message: "Article created successfully"
    });

  } catch (err) {
    console.error("Error creating article:", err);
    if (err.code === 11000) {
      res.status(400).json({ 
        message: "Article with this number already exists" 
      });
    } else {
      res.status(400).json({ 
        message: "Error creating article",
        error: err.message 
      });
    }
  }
});

// ===============================
// BULK CREATE articles
// ===============================
router.post("/bulk", async (req, res) => {
  try {
    const { articles } = req.body;
    
    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ 
        message: "Please provide an array of articles" 
      });
    }

    if (articles.length > 1000) {
      return res.status(400).json({ 
        message: "Maximum 1000 articles can be created at once" 
      });
    }

    // Validate all articles first
    const validatedArticles = articles.map((article, index) => {
      if (!article.articleNumber || !article.articleName) {
        throw new Error(`Article at index ${index}: Article number and name are required`);
      }
      
      return {
        articleNumber: parseInt(article.articleNumber),
        articleName: article.articleName.trim(),
        unit: article.unit ? article.unit.trim() : '',
        packageSize: article.packageSize ? parseFloat(article.packageSize) : 0,
        purchasePrice: article.purchasePrice ? parseFloat(article.purchasePrice) : 0,
        salesPrice: article.salesPrice ? parseFloat(article.salesPrice) : 0
      };
    });

    // Use insertMany with ordered:false for better performance
    const result = await Article.insertMany(validatedArticles, { 
      ordered: false // Continue inserting even if some fail
    });

    res.status(201).json({
      message: `Successfully created ${result.length} articles`,
      created: result.length,
      articles: result
    });

  } catch (err) {
    console.error("Error bulk creating articles:", err);
    res.status(400).json({ 
      message: "Error in bulk creation",
      error: err.message 
    });
  }
});

// ===============================
// UPDATE an existing article
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const { articleNumber, articleName, unit, packageSize, purchasePrice, salesPrice } = req.body;

    // Enhanced validation
    if (!articleNumber || !articleName) {
      return res.status(400).json({ 
        message: "Article number and name are required" 
      });
    }

    // Check for duplicate article number (excluding current article)
    const existingArticle = await Article.findOne({ 
      articleNumber: parseInt(articleNumber),
      _id: { $ne: req.params.id }
    });
    
    if (existingArticle) {
      return res.status(400).json({ 
        message: `Article number ${articleNumber} already exists` 
      });
    }

    const updatedData = {
      articleNumber: parseInt(articleNumber),
      articleName: articleName.trim(),
      unit: unit ? unit.trim() : '',
      packageSize: packageSize ? parseFloat(packageSize) : 0,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : 0,
      salesPrice: salesPrice ? parseFloat(salesPrice) : 0,
      updatedAt: new Date()
    };

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({
      article,
      message: "Article updated successfully"
    });

  } catch (err) {
    console.error("Error updating article:", err);
    res.status(400).json({ 
      message: "Error updating article",
      error: err.message 
    });
  }
});

// ===============================
// DELETE an article
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ 
      message: "Article deleted successfully",
      deletedArticle: {
        id: article._id,
        articleNumber: article.articleNumber,
        articleName: article.articleName
      }
    });

  } catch (err) {
    console.error("Error deleting article:", err);
    res.status(400).json({ 
      message: "Error deleting article",
      error: err.message 
    });
  }
});

// ===============================
// BULK DELETE articles
// ===============================
router.delete("/bulk/:ids", async (req, res) => {
  try {
    const ids = req.params.ids.split(',');
    
    if (ids.length > 100) {
      return res.status(400).json({ 
        message: "Maximum 100 articles can be deleted at once" 
      });
    }

    const result = await Article.deleteMany({
      _id: { $in: ids }
    });

    res.json({
      message: `Successfully deleted ${result.deletedCount} articles`,
      deletedCount: result.deletedCount
    });

  } catch (err) {
    console.error("Error bulk deleting articles:", err);
    res.status(400).json({ 
      message: "Error in bulk deletion",
      error: err.message 
    });
  }
});

export default router;