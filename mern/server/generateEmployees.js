// generateEmployees.js - Generate realistic employees for testing
import mongoose from "mongoose";
import Employee from "./models/Employee.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

// Realistic employee data
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
  'Charles', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra',
  'Donald', 'Donna', 'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah', 'Edward', 'Dorothy',
  'Ronald', 'Amy', 'Timothy', 'Angela', 'Jason', 'Ashley', 'Jeffrey', 'Brenda', 'Ryan', 'Emma'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const departments = {
  'Engineering': [
    'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer', 'Software Architect',
    'DevOps Engineer', 'Data Engineer', 'Machine Learning Engineer', 'QA Engineer', 'Systems Engineer',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer'
  ],
  'Marketing': [
    'Marketing Manager', 'Digital Marketing Specialist', 'Content Marketing Manager', 'SEO Specialist',
    'Social Media Manager', 'Brand Manager', 'Product Marketing Manager', 'Marketing Analyst',
    'Campaign Manager', 'Marketing Coordinator', 'Growth Marketing Manager'
  ],
  'Sales': [
    'Sales Representative', 'Senior Sales Representative', 'Sales Manager', 'Account Manager',
    'Business Development Manager', 'Sales Director', 'Inside Sales Representative',
    'Field Sales Representative', 'Key Account Manager', 'Sales Analyst'
  ],
  'HR': [
    'HR Manager', 'HR Generalist', 'HR Specialist', 'Recruiter', 'Talent Acquisition Specialist',
    'HR Business Partner', 'Training Manager', 'Compensation Analyst', 'Employee Relations Specialist'
  ],
  'Finance': [
    'Financial Analyst', 'Senior Financial Analyst', 'Accountant', 'Senior Accountant', 'Controller',
    'Finance Manager', 'Budget Analyst', 'Tax Specialist', 'Accounts Payable Specialist',
    'Accounts Receivable Specialist', 'Financial Planning Analyst'
  ],
  'Operations': [
    'Operations Manager', 'Project Manager', 'Senior Project Manager', 'Operations Analyst',
    'Process Improvement Specialist', 'Supply Chain Manager', 'Logistics Coordinator',
    'Operations Coordinator', 'Business Analyst', 'Operations Director'
  ],
  'Support': [
    'Customer Support Representative', 'Technical Support Specialist', 'Customer Success Manager',
    'Support Team Lead', 'Help Desk Technician', 'Client Services Representative',
    'Customer Experience Specialist', 'Support Analyst'
  ],
  'IT': [
    'IT Manager', 'System Administrator', 'Network Administrator', 'IT Support Specialist',
    'Database Administrator', 'Security Analyst', 'IT Director', 'Infrastructure Engineer',
    'Help Desk Technician', 'IT Coordinator'
  ],
  'Management': [
    'CEO', 'CTO', 'CFO', 'COO', 'VP Engineering', 'VP Sales', 'VP Marketing', 'VP Operations',
    'Director of Engineering', 'Director of Sales', 'Director of Marketing', 'Director of HR',
    'General Manager', 'Regional Manager', 'Department Head'
  ]
};

const emailDomains = ['company.com', 'corp.com', 'enterprise.com'];

function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhoneNumber() {
  const areaCode = randomBetween(200, 999);
  const exchange = randomBetween(200, 999);
  const number = randomBetween(1000, 9999);
  return `(${areaCode}) ${exchange}-${number}`;
}

function generateEmail(firstName, lastName) {
  const domain = randomPick(emailDomains);
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  return `${username}@${domain}`;
}

function generateEmployee(id) {
  const firstName = randomPick(firstNames);
  const lastName = randomPick(lastNames);
  const department = randomPick(Object.keys(departments));
  const jobTitle = randomPick(departments[department]);
  
  return {
    name: `${firstName} ${lastName}`,
    email: generateEmail(firstName, lastName),
    phone: generatePhoneNumber(),
    job: jobTitle,
    department: department,
    employeeType: randomPick(['full-time', 'part-time', 'contractor']),
    status: randomPick(['active', 'active', 'active', 'active', 'on-leave']), // 80% active
    hireDate: new Date(Date.now() - randomBetween(30, 1825) * 24 * 60 * 60 * 1000), // 1 month to 5 years ago
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function generateEmployees(count = 500) {
  console.log(`🚀 Generating ${count} employees...`);
  console.log('👥 Creating realistic employee data\n');

  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing employees
    await Employee.deleteMany({});
    console.log('🧹 Cleared existing employee data\n');

    const employees = [];
    
    for (let i = 1; i <= count; i++) {
      employees.push(generateEmployee(i));
      
      if (i % 50 === 0) {
        console.log(`📈 Generated ${i}/${count} employees...`);
      }
    }

    await Employee.insertMany(employees);
    
    // Show department distribution
    const deptStats = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n🎉 SUCCESS! Employee generation complete!');
    console.log(`📊 Generated ${count} employees\n`);
    
    console.log('📈 Department Distribution:');
    deptStats.forEach(dept => {
      console.log(`   ${dept._id}: ${dept.count} employees`);
    });

    console.log('\n🚀 Your employee management system is ready!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Generate 500 employees by default, or pass a number as argument
const count = process.argv[2] ? parseInt(process.argv[2]) : 500;
generateEmployees(count);