import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/mern_employees", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Schema & Model
const employeeSchema = new mongoose.Schema({
  name: String,
  role: String,
});
const Employee = mongoose.model("Employee", employeeSchema);

// API Routes
app.post("/api/employees", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/employees", async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

// Start server
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
