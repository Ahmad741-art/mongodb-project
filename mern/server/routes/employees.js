import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

// ===============================
// GET all employees with pagination, search, and sorting
// ===============================
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      sortBy = "name",
      sortOrder = "asc",
      department = ""
    } = req.query;

    // Convert to numbers
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(500, Math.max(1, parseInt(limit))); // Cap at 500 for performance
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery = {};
    if (search && search.trim()) {
      const searchTerm = search.trim();
      searchQuery = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { phone: { $regex: searchTerm, $options: 'i' } },
          { job: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }

    // Add department filter if specified
    if (department && department.trim() && department !== "all") {
      searchQuery.job = { $regex: department.trim(), $options: 'i' };
    }

    // Build sort query
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    let sortQuery = {};
    
    // Validate sort field to prevent injection
    const allowedSortFields = ['name', 'email', 'phone', 'job', 'createdAt'];
    if (allowedSortFields.includes(sortBy)) {
      sortQuery[sortBy] = sortDirection;
    } else {
      sortQuery.name = 1; // Default sort
    }

    // Execute queries in parallel for better performance
    const [employees, totalCount] = await Promise.all([
      Employee.find(searchQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance
      Employee.countDocuments(searchQuery)
    ]);

    // Calculate additional metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Get department statistics
    const departmentStats = await Employee.aggregate([
      { $match: search ? searchQuery : {} },
      {
        $group: {
          _id: "$job",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Send enhanced response
    res.json({
      employees,
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
        resultsFound: totalCount,
        department: department || "all"
      },
      sort: {
        field: sortBy,
        order: sortOrder
      },
      departmentStats: departmentStats.reduce((acc, dept) => {
        acc[dept._id || 'Unassigned'] = dept.count;
        return acc;
      }, {}),
      meta: {
        timestamp: new Date().toISOString()
      },
      // For backward compatibility
      total: totalCount
    });

  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ 
      message: "Server error while fetching employees",
      error: err.message 
    });
  }
});

// ===============================
// GET employee statistics
// ===============================
router.get("/stats", async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();

    // Department distribution
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: "$job",
          count: { $sum: 1 },
          employees: { $push: "$name" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Email domain analysis
    const emailDomains = await Employee.aggregate([
      {
        $match: { email: { $exists: true, $ne: "" } }
      },
      {
        $project: {
          domain: {
            $substr: [
              "$email",
              { $add: [{ $indexOfCP: ["$email", "@"] }, 1] },
              { $strLenCP: "$email" }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$domain",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent additions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAdditions = await Employee.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      overview: {
        totalEmployees,
        totalDepartments: departmentStats.length,
        recentAdditions,
        averageEmployeesPerDepartment: Math.round(totalEmployees / departmentStats.length)
      },
      departmentDistribution: departmentStats.map(dept => ({
        department: dept._id || 'Unassigned',
        count: dept.count,
        percentage: Math.round((dept.count / totalEmployees) * 100)
      })),
      emailDomains: emailDomains.map(domain => ({
        domain: domain._id,
        count: domain.count
      })),
      generatedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error("Error generating employee statistics:", err);
    res.status(500).json({ 
      message: "Error generating statistics",
      error: err.message 
    });
  }
});

// ===============================
// GET one employee by ID
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(400).json({ message: "Invalid employee ID" });
  }
});

// ===============================
// CREATE a new employee with validation
// ===============================
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, job } = req.body;

    // Enhanced validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        message: "Name is required and must be at least 2 characters" 
      });
    }

    // Email validation
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ 
          message: "Please provide a valid email address" 
        });
      }
      
      // Check for duplicate email
      const existingEmployee = await Employee.findOne({ 
        email: email.trim().toLowerCase() 
      });
      if (existingEmployee) {
        return res.status(400).json({ 
          message: `Employee with email ${email} already exists` 
        });
      }
    }

    // Phone validation (basic)
    if (phone && phone.trim()) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({ 
          message: "Please provide a valid phone number" 
        });
      }
    }

    const employee = new Employee({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? phone.trim() : '',
      job: job ? job.trim() : '',
      createdAt: new Date()
    });

    await employee.save();
    res.status(201).json({
      employee,
      message: "Employee created successfully"
    });

  } catch (err) {
    console.error("Error creating employee:", err);
    if (err.code === 11000) {
      res.status(400).json({ 
        message: "Employee with this email already exists" 
      });
    } else {
      res.status(400).json({ 
        message: "Error creating employee",
        error: err.message 
      });
    }
  }
});

// ===============================
// BULK CREATE employees
// ===============================
router.post("/bulk", async (req, res) => {
  try {
    const { employees } = req.body;
    
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ 
        message: "Please provide an array of employees" 
      });
    }

    if (employees.length > 500) {
      return res.status(400).json({ 
        message: "Maximum 500 employees can be created at once" 
      });
    }

    // Validate all employees first
    const validatedEmployees = employees.map((employee, index) => {
      if (!employee.name || employee.name.trim().length < 2) {
        throw new Error(`Employee at index ${index}: Name is required and must be at least 2 characters`);
      }
      
      if (employee.email && employee.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(employee.email.trim())) {
          throw new Error(`Employee at index ${index}: Invalid email format`);
        }
      }
      
      return {
        name: employee.name.trim(),
        email: employee.email ? employee.email.trim().toLowerCase() : '',
        phone: employee.phone ? employee.phone.trim() : '',
        job: employee.job ? employee.job.trim() : '',
        createdAt: new Date()
      };
    });

    // Check for duplicate emails within the batch
    const emailMap = new Map();
    validatedEmployees.forEach((emp, index) => {
      if (emp.email) {
        if (emailMap.has(emp.email)) {
          throw new Error(`Duplicate email found at indices ${emailMap.get(emp.email)} and ${index}: ${emp.email}`);
        }
        emailMap.set(emp.email, index);
      }
    });

    // Use insertMany with ordered:false for better performance
    const result = await Employee.insertMany(validatedEmployees, { 
      ordered: false // Continue inserting even if some fail
    });

    res.status(201).json({
      message: `Successfully created ${result.length} employees`,
      created: result.length,
      employees: result
    });

  } catch (err) {
    console.error("Error bulk creating employees:", err);
    res.status(400).json({ 
      message: "Error in bulk creation",
      error: err.message 
    });
  }
});

// ===============================
// UPDATE an existing employee
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, job } = req.body;

    // Enhanced validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        message: "Name is required and must be at least 2 characters" 
      });
    }

    // Email validation
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ 
          message: "Please provide a valid email address" 
        });
      }
      
      // Check for duplicate email (excluding current employee)
      const existingEmployee = await Employee.findOne({ 
        email: email.trim().toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingEmployee) {
        return res.status(400).json({ 
          message: `Employee with email ${email} already exists` 
        });
      }
    }

    const updatedData = {
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? phone.trim() : '',
      job: job ? job.trim() : '',
      updatedAt: new Date()
    };

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      employee,
      message: "Employee updated successfully"
    });

  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(400).json({ 
      message: "Error updating employee",
      error: err.message 
    });
  }
});

// ===============================
// DELETE an employee
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ 
      message: "Employee deleted successfully",
      deletedEmployee: {
        id: employee._id,
        name: employee.name,
        email: employee.email
      }
    });

  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(400).json({ 
      message: "Error deleting employee",
      error: err.message 
    });
  }
});

// ===============================
// BULK DELETE employees
// ===============================
router.delete("/bulk/:ids", async (req, res) => {
  try {
    const ids = req.params.ids.split(',');
    
    if (ids.length > 50) {
      return res.status(400).json({ 
        message: "Maximum 50 employees can be deleted at once" 
      });
    }

    const result = await Employee.deleteMany({
      _id: { $in: ids }
    });

    res.json({
      message: `Successfully deleted ${result.deletedCount} employees`,
      deletedCount: result.deletedCount
    });

  } catch (err) {
    console.error("Error bulk deleting employees:", err);
    res.status(400).json({ 
      message: "Error in bulk deletion",
      error: err.message 
    });
  }
});

// ===============================
// EXPORT employees (CSV format data)
// ===============================
router.get("/export/csv", async (req, res) => {
  try {
    const { department = "", search = "" } = req.query;

    let query = {};
    
    // Add search filter
    if (search && search.trim()) {
      const searchTerm = search.trim();
              query = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { phone: { $regex: searchTerm, $options: 'i' } },
          { job: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }

    // Add department filter
    if (department && department.trim() && department !== "all") {
      query.job = { $regex: department.trim(), $options: 'i' };
    }

    const employees = await Employee.find(query)
      .sort({ name: 1 })
      .lean();

    // Convert to CSV format data
    const csvData = employees.map(emp => ({
      ID: emp._id.toString(),
      Name: emp.name || '',
      Email: emp.email || '',
      Phone: emp.phone || '',
      Department: emp.job || 'Unassigned',
      'Created Date': emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '',
      'Last Updated': emp.updatedAt ? new Date(emp.updatedAt).toLocaleDateString() : ''
    }));

    res.json({
      data: csvData,
      meta: {
        totalRecords: csvData.length,
        exportDate: new Date().toISOString(),
        filters: { department, search }
      }
    });

  } catch (err) {
    console.error("Error exporting employees:", err);
    res.status(500).json({ 
      message: "Error exporting employee data",
      error: err.message 
    });
  }
});

export default router;