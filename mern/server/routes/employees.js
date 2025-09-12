import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

// ===============================
// GET all employees
// ===============================
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// GET one employee by ID
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(400).json({ message: "Invalid employee ID" });
  }
});

// ===============================
// CREATE a new employee
// ===============================
router.post("/", async (req, res) => {
  console.log("Received body:", req.body); // debug log
  try {
    // Ensure all 4 fields are included
    const { name, email, phone, job } = req.body;
    const employee = new Employee({ name, email, phone, job });
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(400).json({ message: err.message });
  }
});

// ===============================
// UPDATE an existing employee
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, job } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, job },
      { new: true }
    );
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(400).json({ message: "Invalid employee ID" });
  }
});

// ===============================
// DELETE an employee
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(400).json({ message: "Invalid employee ID" });
  }
});

export default router;
