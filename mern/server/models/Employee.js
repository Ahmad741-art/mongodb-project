import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  // Basic Information
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: [20, 'Employee ID cannot exceed 20 characters']
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    index: 'text' // Enable text search
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true, // Allow null but enforce uniqueness when present
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    },
    index: true
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[\+]?[\d\s\-\(\)]{7,}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  
  // Professional Information
  job: {
    type: String,
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters'],
    default: 'Employee'
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters'],
    enum: {
      values: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Support', 'Management', 'IT', 'Legal', 'Research', 'Quality Assurance', 'Other'],
      message: '{VALUE} is not a valid department'
    },
    default: 'Other'
  },
  employeeType: {
    type: String,
    enum: {
      values: ['full-time', 'part-time', 'contractor', 'intern', 'consultant'],
      message: '{VALUE} is not a valid employee type'
    },
    default: 'full-time'
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'terminated', 'on-leave'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active',
    index: true
  },
  
  // Employment Details
  hireDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v <= new Date();
      },
      message: 'Hire date cannot be in the future'
    }
  },
  terminationDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || !this.hireDate || v >= this.hireDate;
      },
      message: 'Termination date cannot be before hire date'
    }
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative'],
    set: function(v) {
      return v ? Math.round(v * 100) / 100 : v; // Round to 2 decimal places
    }
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NOK', 'DKK'],
    default: 'USD'
  },
  
  // Contact Information
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'ZIP code cannot exceed 20 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
      default: 'United States'
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: [50, 'Relationship cannot exceed 50 characters']
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^[\+]?[\d\s\-\(\)]{7,}$/.test(v);
        },
        message: 'Please provide a valid emergency contact phone number'
      }
    }
  },
  
  // Skills and Qualifications
  skills: [{
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters']
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
      max: [50, 'Years of experience cannot exceed 50']
    }
  }],
  
  education: [{
    institution: {
      type: String,
      trim: true,
      maxlength: [200, 'Institution name cannot exceed 200 characters']
    },
    degree: {
      type: String,
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters']
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: [100, 'Field of study cannot exceed 100 characters']
    },
    graduationYear: {
      type: Number,
      min: [1950, 'Graduation year must be after 1950'],
      max: [new Date().getFullYear() + 10, 'Graduation year cannot be too far in the future']
    }
  }],
  
  // Performance and HR
  performanceRating: {
    type: Number,
    min: [1, 'Performance rating must be between 1 and 5'],
    max: [5, 'Performance rating must be between 1 and 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Performance rating must be a whole number'
    }
  },
  lastReviewDate: Date,
  nextReviewDate: Date,
  
  // System fields
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
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
  }
}, {
  // Schema options
  timestamps: true, // Automatically manage createdAt and updatedAt
  versionKey: false, // Disable __v field
  toJSON: { virtuals: true }, // Include virtuals when converting to JSON
  toObject: { virtuals: true }
});

// Virtual fields (computed properties)
employeeSchema.virtual('fullName').get(function() {
  return this.name;
});

employeeSchema.virtual('yearsOfService').get(function() {
  if (!this.hireDate) return 0;
  const endDate = this.terminationDate || new Date();
  const years = (endDate - this.hireDate) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.floor(years * 10) / 10; // Round to 1 decimal place
});

employeeSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

employeeSchema.virtual('displayId').get(function() {
  return this.employeeId || this._id.toString().slice(-6).toUpperCase();
});

employeeSchema.virtual('nextBirthday').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthday = new Date(today.getFullYear(), this.dateOfBirth.getMonth(), this.dateOfBirth.getDate());
  if (birthday < today) {
    birthday.setFullYear(today.getFullYear() + 1);
  }
  return birthday;
});

// Indexes for better query performance
employeeSchema.index({ name: 'text', 'skills.name': 'text' }); // Text search
employeeSchema.index({ department: 1, status: 1 }); // Department and status queries
employeeSchema.index({ job: 1 }); // Job title queries
employeeSchema.index({ hireDate: -1 }); // Hire date queries
employeeSchema.index({ email: 1 }, { unique: true, sparse: true }); // Email uniqueness
employeeSchema.index({ employeeId: 1 }, { unique: true, sparse: true }); // Employee ID uniqueness

// Pre-save middleware
employeeSchema.pre('save', function(next) {
  // Auto-generate employee ID if not provided
  if (!this.employeeId && this.isNew) {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.employeeId = `EMP${year}${randomNum}`;
  }
  
  // Set department based on job if not provided
  if (!this.department || this.department === 'Other') {
    const jobToDept = {
      'Software Engineer': 'Engineering',
      'Developer': 'Engineering',
      'Marketing Manager': 'Marketing',
      'Sales Representative': 'Sales',
      'HR Manager': 'HR',
      'Accountant': 'Finance',
      'Operations Manager': 'Operations',
      'Support Specialist': 'Support',
      'IT Specialist': 'IT'
    };
    
    const matchedDept = Object.keys(jobToDept).find(job => 
      this.job && this.job.toLowerCase().includes(job.toLowerCase())
    );
    
    if (matchedDept) {
      this.department = jobToDept[matchedDept];
    }
  }
  
  // Validate termination logic
  if (this.terminationDate && this.status === 'active') {
    this.status = 'terminated';
  }
  
  next();
});

// Pre-update middleware
employeeSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Static methods (callable on the model)
employeeSchema.statics.findByDepartment = function(department) {
  return this.find({ department: department, status: 'active' });
};

employeeSchema.statics.findActiveEmployees = function() {
  return this.find({ status: 'active' });
};

employeeSchema.statics.findBySkill = function(skillName) {
  return this.find({
    'skills.name': { $regex: skillName, $options: 'i' },
    status: 'active'
  });
};

employeeSchema.statics.findUpcomingReviews = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    nextReviewDate: { $lte: futureDate },
    status: 'active'
  });
};

employeeSchema.statics.getEmployeeStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        avgSalary: { $avg: '$salary' },
        avgYearsOfService: { $avg: { $divide: [{ $subtract: [new Date(), '$hireDate'] }, 31557600000] } }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Instance methods (callable on document instances)
employeeSchema.methods.promoteEmployee = function(newJobTitle, newSalary) {
  this.job = newJobTitle;
  if (newSalary) this.salary = newSalary;
  this.updatedAt = new Date();
  return this.save();
};

employeeSchema.methods.terminateEmployee = function(terminationDate = new Date(), reason = '') {
  this.status = 'terminated';
  this.terminationDate = terminationDate;
  if (reason) {
    this.notes = this.notes ? `${this.notes}\n\nTermination: ${reason}` : `Termination: ${reason}`;
  }
  return this.save();
};

employeeSchema.methods.addSkill = function(skillName, level = 'intermediate', years = 0) {
  // Check if skill already exists
  const existingSkill = this.skills.find(skill => 
    skill.name.toLowerCase() === skillName.toLowerCase()
  );
  
  if (existingSkill) {
    existingSkill.level = level;
    existingSkill.yearsOfExperience = years;
  } else {
    this.skills.push({
      name: skillName,
      level: level,
      yearsOfExperience: years
    });
  }
  
  return this.save();
};

employeeSchema.methods.scheduleReview = function(reviewDate) {
  this.nextReviewDate = reviewDate;
  return this.save();
};

// Error handling middleware
employeeSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    let message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    
    if (field === 'email') {
      message = 'An employee with this email address already exists';
    } else if (field === 'employeeId') {
      message = 'An employee with this ID already exists';
    }
    
    next(new Error(message));
  } else {
    next(error);
  }
});

// Create and export the model
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;